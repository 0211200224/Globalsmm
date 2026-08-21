import "server-only";

import { prisma } from "@/lib/prisma";
import { createCommissionForOrder, settleCommissionForOrder } from "@/lib/actions/affiliate";
import { createNotification } from "@/lib/notifications-core";
import { getProviderClient } from "@/lib/fulfillment/get-provider-client";
import { getEffectiveDiscountPercent } from "@/lib/vip";
import type { Order, Prisma } from "@/generated/prisma/client";

export type PlaceOrderResult =
  | { success: true; orderId: string; orderNumber: number; chargedAmount: number }
  | { success: false; error: string };

const QUALIFYING_SPEND_STATUSES: Prisma.OrderWhereInput["status"] = {
  notIn: ["CANCELED", "REFUNDED"],
};

/**
 * Shared by placeOrder (provider rejects an order at auto-dispatch time)
 * and admin-orders.ts's updateOrderStatus (admin manually cancels/
 * refunds) -- both need the exact same "give the money back" sequence:
 * credit the wallet, log a REFUND Transaction, void any pending referral
 * commission, notify the customer.
 */
export async function refundOrder(
  tx: Prisma.TransactionClient,
  order: Pick<Order, "id" | "userId" | "orderNumber" | "chargedAmount">,
  opts: { status: "CANCELED" | "REFUNDED"; adminNote?: string; notifyBody?: string },
) {
  await tx.order.update({
    where: { id: order.id },
    data: {
      status: opts.status,
      ...(opts.adminNote ? { adminNote: opts.adminNote } : {}),
    },
  });

  const wallet = await tx.wallet.findUnique({ where: { userId: order.userId } });
  if (wallet) {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: order.chargedAmount } },
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: "REFUND",
        status: "COMPLETED",
        amount: order.chargedAmount,
        method: "wallet",
      },
    });
  }

  await settleCommissionForOrder(order.id, "VOID");

  await createNotification(
    {
      userId: order.userId,
      type: "ORDER_STATUS",
      title: `Order #GS-${90000 + order.orderNumber} is now ${opts.status === "CANCELED" ? "Canceled" : "Refunded"}`,
      body:
        opts.notifyBody ??
        "Your order was canceled and the amount was refunded to your wallet.",
      link: "/orders",
    },
    tx,
  );
}

/**
 * Core order-placement logic shared by the web checkout (src/lib/actions/orders.ts)
 * and the reseller API (src/app/api/v2/route.ts) — same validation, same
 * VIP/reseller discount, same atomic wallet debit. Callers are responsible
 * for authenticating the caller and resolving `userId` first; this function
 * doesn't touch cookies or API keys.
 *
 * Fulfillment is automatic: if the service has a Provider mapped (see
 * /admin/services), the order dispatches to it right here, synchronously,
 * before this function returns -- no admin approval step. Services with no
 * provider mapped stay PENDING for manual handling in /admin/orders, same
 * as before any provider integration existed. A provider rejection never
 * leaves the customer out of pocket: the charge is refunded immediately
 * and placeOrder reports failure, rather than silently canceling an order
 * already reported as placed.
 */
export async function placeOrder({
  userId,
  serviceId,
  quantity,
  targetLink,
  source,
}: {
  userId: string;
  serviceId: string;
  quantity: number;
  targetLink: string;
  source: "WEB" | "API";
}): Promise<PlaceOrderResult> {
  const link = targetLink.trim();
  if (!link) return { success: false, error: "Link or username is required." };

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, error: "Quantity must be a positive whole number." };
  }

  const [user, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
  ]);

  if (!user) return { success: false, error: "Account not found." };
  if (!user.wallet) {
    return { success: false, error: "Your wallet isn't set up yet. Please try again in a moment." };
  }
  if (!service || !service.active) {
    return { success: false, error: "This service is no longer available." };
  }
  if (quantity < service.minQuantity || quantity > service.maxQuantity) {
    return {
      success: false,
      error: `Quantity must be between ${service.minQuantity.toLocaleString("en-US")} and ${service.maxQuantity.toLocaleString("en-US")}.`,
    };
  }

  const spendAgg = await prisma.order.aggregate({
    where: { userId, status: QUALIFYING_SPEND_STATUSES },
    _sum: { chargedAmount: true },
  });
  const lifetimeSpend = spendAgg._sum.chargedAmount?.toNumber() ?? 0;
  const discountPercent = getEffectiveDiscountPercent(lifetimeSpend, user.isReseller);

  const basePrice = (quantity / 1000) * service.pricePer1000.toNumber();
  const chargedAmount =
    Math.round((basePrice * (1 - discountPercent / 100) + Number.EPSILON) * 100) / 100;

  let order: Order;
  try {
    order = await prisma.$transaction(async (tx) => {
      const debited = await tx.wallet.updateMany({
        where: { id: user.wallet!.id, balance: { gte: chargedAmount } },
        data: { balance: { decrement: chargedAmount } },
      });
      if (debited.count === 0) throw new Error("INSUFFICIENT_BALANCE");

      await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "DEBIT",
          status: "COMPLETED",
          amount: chargedAmount,
          method: "wallet",
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          quantity,
          targetLink: link,
          chargedAmount,
          status: "PENDING",
          source,
        },
      });

      await createCommissionForOrder(tx, {
        id: createdOrder.id,
        userId: createdOrder.userId,
        chargedAmount: createdOrder.chargedAmount,
      });

      return createdOrder;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return { success: false, error: "Insufficient wallet balance." };
    }
    console.error("placeOrder failed:", err);
    return { success: false, error: "Something went wrong placing the order. Please try again." };
  }

  // Auto-dispatch outside the DB transaction above (this is a network call
  // to the provider's API, which must never hold a DB transaction open).
  if (service.providerId && service.externalServiceId) {
    const provider = await prisma.provider.findUnique({ where: { id: service.providerId } });
    if (provider?.active) {
      try {
        const client = getProviderClient(provider);
        const { externalOrderId } = await client.placeOrder({
          externalServiceId: service.externalServiceId,
          link,
          quantity,
          idempotencyKey: order.id,
        });

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "PROCESSING", providerId: provider.id, externalOrderId },
          });
          await createNotification(
            {
              userId: order.userId,
              type: "ORDER_STATUS",
              title: `Order #GS-${90000 + order.orderNumber} is now Processing`,
              body: "Your order was placed and sent for fulfillment.",
              link: "/orders",
            },
            tx,
          );
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown provider error";
        console.error(`placeOrder: provider rejected order ${order.id}:`, message);

        await prisma.$transaction(async (tx) => {
          await refundOrder(tx, order, {
            status: "CANCELED",
            adminNote: `[Provider rejected: ${message}]`,
            notifyBody: "Your order could not be fulfilled and was refunded to your wallet.",
          });
        });

        return {
          success: false,
          error: `This service is temporarily unavailable (${message}). Your payment was refunded.`,
        };
      }
    }
  }

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    chargedAmount,
  };
}
