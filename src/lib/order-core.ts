import "server-only";

import { prisma } from "@/lib/prisma";
import { createCommissionForOrder } from "@/lib/actions/affiliate";
import { getEffectiveDiscountPercent } from "@/lib/vip";
import type { Prisma } from "@/generated/prisma/client";

export type PlaceOrderResult =
  | { success: true; orderId: string; orderNumber: number; chargedAmount: number }
  | { success: false; error: string };

const QUALIFYING_SPEND_STATUSES: Prisma.OrderWhereInput["status"] = {
  notIn: ["CANCELED", "REFUNDED"],
};

/**
 * Core order-placement logic shared by the web checkout (src/lib/actions/orders.ts)
 * and the reseller API (src/app/api/v2/route.ts) — same validation, same
 * VIP/reseller discount, same atomic wallet debit. Callers are responsible
 * for authenticating the caller and resolving `userId` first; this function
 * doesn't touch cookies or API keys.
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

  try {
    const order = await prisma.$transaction(async (tx) => {
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
          status: "PENDING_ADMIN",
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

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      chargedAmount,
    };
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return { success: false, error: "Insufficient wallet balance." };
    }
    console.error("placeOrder failed:", err);
    return { success: false, error: "Something went wrong placing the order. Please try again." };
  }
}
