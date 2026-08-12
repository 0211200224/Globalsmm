"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { settleCommissionForOrder } from "@/lib/actions/affiliate";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import type { OrderRowStatus } from "@/lib/types/orders";

const REFUNDING_STATUSES: OrderRowStatus[] = ["CANCELED", "REFUNDED"];

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
    await tx.order.update({ where: { id: orderId }, data: { status } });

    if (willRefund && !wasRefunding) {
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
    }

    if (status === "COMPLETED") {
      await settleCommissionForOrder(orderId, "AVAILABLE");
    } else if (willRefund) {
      await settleCommissionForOrder(orderId, "VOID");
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/affiliate");

  return { success: true as const };
}
