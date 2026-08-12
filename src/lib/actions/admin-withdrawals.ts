"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertIsAdmin } from "@/lib/actions/admin-guard";
import type { WithdrawalStatus } from "@/generated/prisma/client";

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
    });
  } else {
    await prisma.referralWithdrawal.update({
      where: { id: withdrawalId },
      data: { status },
    });
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/affiliate");
  return { success: true as const };
}
