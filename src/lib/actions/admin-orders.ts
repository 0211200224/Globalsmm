"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { settleCommissionForOrder } from "@/lib/actions/affiliate";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import { createNotification } from "@/lib/actions/notifications";
import { getProviderClient } from "@/lib/fulfillment/get-provider-client";
import type { OrderRowStatus } from "@/lib/types/orders";
import type { Order, Prisma } from "@/generated/prisma/client";

const STATUS_LABELS: Record<OrderRowStatus, string> = {
  PENDING: "Pending",
  PENDING_ADMIN: "Pending Approval",
  PROCESSING: "Processing",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PARTIAL: "Partial",
  CANCELED: "Canceled",
  REFUNDED: "Refunded",
};

const REFUNDING_STATUSES: OrderRowStatus[] = ["CANCELED", "REFUNDED"];

function revalidateOrderPaths() {
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/affiliate");
}

/**
 * Shared by updateOrderStatus (admin manually cancels/refunds) and
 * approveOrder (provider rejects the order at dispatch time) — both need
 * the exact same "give the money back" sequence: credit the wallet, log a
 * REFUND Transaction, void any pending referral commission, notify the
 * customer.
 */
async function refundOrder(
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
      title: `Order #GS-${90000 + order.orderNumber} is now ${STATUS_LABELS[opts.status]}`,
      body:
        opts.notifyBody ??
        "Your order was canceled and the amount was refunded to your wallet.",
      link: "/orders",
    },
    tx,
  );
}

/**
 * Admin-only. Updates an order's status and applies the matching financial
 * side effects:
 * - CANCELED / REFUNDED: credits the charged amount back to the buyer's
 *   wallet (once — guarded against double-refunding the same order) and
 *   voids any pending/available referral commission tied to it.
 * - COMPLETED: flips a pending referral commission to AVAILABLE.
 */
export async function updateOrderStatus(orderId: string, status: OrderRowStatus) {
  await assertIsAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false as const, error: "Order not found." };

  const wasRefunding = REFUNDING_STATUSES.includes(order.status as OrderRowStatus);
  const willRefund = REFUNDING_STATUSES.includes(status);

  await prisma.$transaction(async (tx) => {
    if (willRefund && !wasRefunding) {
      await refundOrder(tx, order, { status: status as "CANCELED" | "REFUNDED" });
      return;
    }

    await tx.order.update({ where: { id: orderId }, data: { status } });

    if (status === "COMPLETED") {
      await settleCommissionForOrder(orderId, "AVAILABLE");
    }

    await createNotification(
      {
        userId: order.userId,
        type: "ORDER_STATUS",
        title: `Order #GS-${90000 + order.orderNumber} is now ${STATUS_LABELS[status]}`,
        body: `Your order status was updated to ${STATUS_LABELS[status]}.`,
        link: "/orders",
      },
      tx,
    );
  });

  revalidateOrderPaths();
  return { success: true as const };
}

/**
 * Admin-only. Approves a PENDING_ADMIN order from the fulfillment queue.
 * If the order's service (or the admin's override) has a Provider mapped,
 * dispatches the order to that provider's `add` action and stores the
 * returned externalOrderId. A provider rejection never leaves the customer
 * out of pocket — it refunds the order the same way a manual cancel does.
 * Services with no provider mapped stay fully manual: approval just moves
 * the order to PROCESSING for the admin to fulfill by hand, exactly like
 * before this queue existed.
 */
export async function approveOrder(orderId: string, providerIdOverride?: string | null) {
  await assertIsAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true },
  });
  if (!order) return { success: false as const, error: "Order not found." };
  if (order.status !== "PENDING_ADMIN") {
    return { success: false as const, error: "This order has already been reviewed." };
  }

  const resolvedProviderId = providerIdOverride ?? order.service.providerId;

  if (!resolvedProviderId) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: "PROCESSING" } });
      await createNotification(
        {
          userId: order.userId,
          type: "ORDER_STATUS",
          title: `Order #GS-${90000 + order.orderNumber} is now Processing`,
          body: "Your order was approved and is being processed.",
          link: "/orders",
        },
        tx,
      );
    });
    revalidateOrderPaths();
    return { success: true as const };
  }

  const provider = await prisma.provider.findUnique({ where: { id: resolvedProviderId } });
  if (!provider || !provider.active) {
    return { success: false as const, error: "Selected provider is not available." };
  }
  if (!order.service.externalServiceId) {
    return {
      success: false as const,
      error: "This service has no external service id configured for that provider.",
    };
  }

  try {
    const client = getProviderClient(provider);
    const { externalOrderId } = await client.placeOrder({
      externalServiceId: order.service.externalServiceId,
      link: order.targetLink,
      quantity: order.quantity,
      idempotencyKey: order.id,
    });

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING", providerId: provider.id, externalOrderId },
      });
      await createNotification(
        {
          userId: order.userId,
          type: "ORDER_STATUS",
          title: `Order #GS-${90000 + order.orderNumber} is now Processing`,
          body: "Your order was approved and sent for fulfillment.",
          link: "/orders",
        },
        tx,
      );
    });

    revalidateOrderPaths();
    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown provider error";
    console.error(`approveOrder: provider rejected order ${orderId}:`, message);

    await prisma.$transaction(async (tx) => {
      await refundOrder(tx, order, {
        status: "CANCELED",
        adminNote: `[Provider rejected: ${message}]`,
        notifyBody: "Your order could not be fulfilled and was refunded to your wallet.",
      });
    });

    revalidateOrderPaths();
    return { success: false as const, error: `Provider rejected the order: ${message}` };
  }
}
