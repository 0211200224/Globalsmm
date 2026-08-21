"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import { getPaymentStatus } from "@/lib/fapshi";
import { createNotification } from "@/lib/actions/notifications";

/**
 * Manual fallback for Fapshi deposits that never got credited by the
 * webhook (see src/app/api/webhooks/fapshi/route.ts) -- webhooks can fail
 * to arrive for reasons outside our control (misconfiguration on Fapshi's
 * dashboard, network issues, etc.), so this lets an admin reconcile a
 * PENDING transaction directly against Fapshi's own payment-status API
 * instead of leaving a paid customer stuck at their old balance.
 */
export async function checkFapshiDepositStatus(transactionId: string) {
  await assertIsAdmin();

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { wallet: true },
  });
  if (!transaction) return { success: false as const, error: "Transaction not found." };
  if (transaction.method !== "fapshi" || !transaction.externalRef) {
    return { success: false as const, error: "This isn't a Fapshi deposit." };
  }
  if (transaction.status !== "PENDING") {
    return { success: true as const, providerStatus: transaction.status };
  }

  try {
    const result = await getPaymentStatus(transaction.externalRef);

    if (result.status === "SUCCESSFUL") {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({ where: { id: transaction.id }, data: { status: "COMPLETED" } });
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } },
        });
      });
      await createNotification({
        userId: transaction.wallet.userId,
        type: "WALLET_DEPOSIT",
        title: "Deposit confirmed",
        body: "Your deposit was confirmed and your wallet balance was updated.",
        link: "/wallet",
      });
    } else if (result.status === "FAILED" || result.status === "EXPIRED") {
      await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    }

    revalidatePath("/admin/payments");
    return { success: true as const, providerStatus: result.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false as const, error: `Could not reach Fapshi: ${message}` };
  }
}
