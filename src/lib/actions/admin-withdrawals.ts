"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import { createNotification } from "@/lib/actions/notifications";
import { formatUSD } from "@/lib/format";
import type { WithdrawalStatus } from "@/generated/prisma/client";

const STATUS_MESSAGES: Record<WithdrawalStatus, string> = {
  PENDING: "is pending review.",
  APPROVED: "has been approved and is being processed.",
  PAID: "has been paid out.",
  REJECTED: "was rejected. Contact support if you have questions.",
};

/**
 * Admin-only. Approving/rejecting a withdrawal only changes its status.
 * Marking it PAID is the moment funds actually leave the ledger: it flips
 * just-enough AVAILABLE commissions (oldest first) to PAID to cover the
 * withdrawal amount. See requestWithdrawal / getAffiliateSummary in
 * affiliate.ts for why commissions aren't touched any earlier.
 */
export async function setWithdrawalStatus(
  withdrawalId: string,
  status: WithdrawalStatus,
) {
  await assertIsAdmin();

  const withdrawal = await prisma.referralWithdrawal.findUnique({
    where: { id: withdrawalId },
    include: { affiliate: true },
  });
  if (!withdrawal) return { success: false as const, error: "Withdrawal not found." };

  if (status === "PAID" && withdrawal.status !== "PAID") {
    await prisma.$transaction(async (tx) => {
      await tx.referralWithdrawal.update({
        where: { id: withdrawalId },
        data: { status: "PAID" },
      });

      const commissions = await tx.referralCommission.findMany({
        where: { affiliateId: withdrawal.affiliateId, status: "AVAILABLE" },
        orderBy: { createdAt: "asc" },
      });

      let remaining = withdrawal.amount.toNumber();
      const idsToMark: string[] = [];
      for (const commission of commissions) {
        if (remaining <= 0) break;
        idsToMark.push(commission.id);
        remaining -= commission.amount.toNumber();
      }

      await tx.referralCommission.updateMany({
        where: { id: { in: idsToMark } },
        data: { status: "PAID" },
      });

      await createNotification(
        {
          userId: withdrawal.affiliate.userId,
          type: "WITHDRAWAL_STATUS",
          title: `Your ${formatUSD(withdrawal.amount.toNumber())} withdrawal ${STATUS_MESSAGES.PAID}`,
          body: "Funds have been sent — thanks for growing GlobalSMM!",
          link: "/affiliate",
        },
        tx,
      );
    });
  } else {
    await prisma.referralWithdrawal.update({
      where: { id: withdrawalId },
      data: { status },
    });

    await createNotification({
      userId: withdrawal.affiliate.userId,
      type: "WITHDRAWAL_STATUS",
      title: `Your ${formatUSD(withdrawal.amount.toNumber())} withdrawal ${STATUS_MESSAGES[status]}`,
      body:
        status === "REJECTED"
          ? "The requested amount was returned to your available balance."
          : "We'll notify you again when it's paid.",
      link: "/affiliate",
    });
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/affiliate");
  return { success: true as const };
}
