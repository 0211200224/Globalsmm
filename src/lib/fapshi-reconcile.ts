import "server-only";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus } from "@/lib/fapshi";
import { createNotification } from "@/lib/notifications-core";

/**
 * Core reconciliation logic, deliberately NOT in a "use server" file --
 * every export of a "use server" module becomes a client-callable RPC, and
 * this needs to run unauthenticated-by-user (called by the cron route with
 * only a shared-secret check) as well as from the admin-gated action in
 * admin-payments.ts. Keeping it here means neither caller has to duplicate
 * the actual status-check-and-credit logic.
 */
export async function reconcileFapshiTransaction(transactionId: string) {
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

    return { success: true as const, providerStatus: result.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false as const, error: `Could not reach Fapshi: ${message}` };
  }
}
