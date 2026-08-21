"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { settleCommissionForOrder } from "@/lib/actions/affiliate";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import { createNotification } from "@/lib/notifications-core";
import { getProviderClient } from "@/lib/fulfillment/get-provider-client";
import { refundOrder } from "@/lib/order-core";
import type { OrderRowStatus } from "@/lib/types/orders";

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
 * Admin-only. Updates an order's status and applies the matching financial
 * side effects:
 * - CANCELED / REFUNDED: credits the charged amount back to the buyer's
 *   wallet (once — guarded against double-refunding the same order) and
 *   voids any pending referral commission tied to it.
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
 * Maps a provider's free-text status string onto our OrderStatus. Providers
 * mostly agree on this vocabulary (it's the same "Perfect Panel"-style
 * convention referenced in PLANO.md section 6), but an unrecognized string
 * returns null rather than guessing — callers keep the order's current
 * status in that case instead of forcing a wrong one.
 */
function mapProviderStatus(raw: string): OrderRowStatus | null {
  switch (raw.trim().toLowerCase()) {
    case "completed":
      return "COMPLETED";
    case "partial":
      return "PARTIAL";
    case "canceled":
    case "cancelled":
      return "CANCELED";
    case "refunded":
      return "REFUNDED";
    case "processing":
      return "PROCESSING";
    case "in progress":
    case "inprogress":
      return "IN_PROGRESS";
    case "pending":
      return "PENDING";
    default:
      return null;
  }
}

/**
 * Admin-only. Manual, single-order stand-in for the automated status-sync
 * cron (Fase 4) — pulls the live status from whichever provider the order
 * was dispatched to, updates deliveredQuantity, and if the mapped status is
 * a real transition, routes it through updateOrderStatus so refunds/
 * commission settlement/notifications stay exactly consistent with every
 * other way an order's status can change.
 */
export async function checkOrderStatus(orderId: string) {
  await assertIsAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false as const, error: "Order not found." };
  if (!order.providerId || !order.externalOrderId) {
    return { success: false as const, error: "This order wasn't dispatched to a provider." };
  }

  const provider = await prisma.provider.findUnique({ where: { id: order.providerId } });
  if (!provider) return { success: false as const, error: "Provider not found." };

  try {
    const { status, remains } = await getProviderClient(provider).getStatus(order.externalOrderId);

    if (typeof remains === "number") {
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveredQuantity: Math.max(0, order.quantity - remains) },
      });
    }

    const mapped = mapProviderStatus(status);
    if (mapped && mapped !== order.status) {
      await updateOrderStatus(orderId, mapped);
    } else {
      revalidateOrderPaths();
    }

    return { success: true as const, providerStatus: status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown provider error";
    return { success: false as const, error: `Could not fetch status: ${message}` };
  }
}
