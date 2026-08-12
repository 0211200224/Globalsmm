import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { MIN_WITHDRAWAL_USD } from "@/lib/constants";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents after NFD decomposition
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10);
}

/**
 * Generates a unique referral code, retrying with a new random suffix on
 * collision (extremely unlikely, but codes are user-facing so we don't want
 * a crash on the rare collision).
 */
export async function generateUniqueReferralCode(seed: string) {
  const base = slugify(seed) || "member";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.floor(100 + Math.random() * 900); // 3 digits
    const code = `${base}${suffix}`;
    const existing = await prisma.affiliateProfile.findUnique({
      where: { referralCode: code },
    });
    if (!existing) return code;
  }

  // Fall back to a fully random code if we somehow collided 5 times in a row.
  return `${base}${Date.now().toString(36)}`;
}

/**
 * Links a newly-registered user to the affiliate who referred them, if a
 * valid referral code was passed at signup. Best-effort and defensive: never
 * throws — a broken referral link should never block registration.
 *
 * Guards against the cheap version of self-referral (signing up again with
 * your own code using a different email would still work — full abuse
 * prevention needs device/IP heuristics, out of scope for now, see
 * PLANO.md section 7).
 */
export async function linkReferral({
  referralCode,
  newUserId,
}: {
  referralCode: string | null | undefined;
  newUserId: string;
}) {
  if (!referralCode) return;

  try {
    const affiliate = await prisma.affiliateProfile.findUnique({
      where: { referralCode: referralCode.trim() },
    });

    if (!affiliate || affiliate.userId === newUserId) return;

    await prisma.affiliateReferral.upsert({
      where: { referredId: newUserId },
      update: {},
      create: {
        referrerId: affiliate.userId,
        referredId: newUserId,
      },
    });
  } catch (err) {
    console.error("linkReferral failed:", err);
  }
}

/**
 * Creates a PENDING commission for a qualifying order, if the buyer was
 * referred by an affiliate. Called from createOrder — never blocks the
 * order itself on failure.
 */
export async function createCommissionForOrder(
  tx: Prisma.TransactionClient,
  order: { id: string; userId: string; chargedAmount: Prisma.Decimal },
) {
  const referral = await tx.affiliateReferral.findUnique({
    where: { referredId: order.userId },
  });
  if (!referral) return;

  const affiliate = await tx.affiliateProfile.findUnique({
    where: { userId: referral.referrerId },
  });
  if (!affiliate) return;

  const amount =
    Math.round(order.chargedAmount.toNumber() * affiliate.commissionRate.toNumber() * 100) /
    100;

  if (amount <= 0) return;

  await tx.referralCommission.create({
    data: {
      affiliateId: affiliate.id,
      orderId: order.id,
      amount,
      status: "PENDING",
    },
  });
}

/**
 * Flips a completed order's commission to AVAILABLE, or voids it if the
 * order was canceled/refunded. Called from the admin order-status action.
 */
export async function settleCommissionForOrder(
  orderId: string,
  outcome: "AVAILABLE" | "VOID",
) {
  await prisma.referralCommission.updateMany({
    where: { orderId, status: "PENDING" },
    data: { status: outcome },
  });
}

export async function getAffiliateSummary(userId: string) {
  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId },
  });

  if (!affiliate) return null;

  const [
    pendingAgg,
    availableAgg,
    paidAgg,
    outstandingWithdrawalsAgg,
    totalReferrals,
    activeReferrals,
    history,
  ] = await Promise.all([
    prisma.referralCommission.aggregate({
      where: { affiliateId: affiliate.id, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.referralCommission.aggregate({
      where: { affiliateId: affiliate.id, status: "AVAILABLE" },
      _sum: { amount: true },
    }),
    prisma.referralCommission.aggregate({
      where: { affiliateId: affiliate.id, status: "PAID" },
      _sum: { amount: true },
    }),
    // Withdrawals already requested but not yet paid — reserved, so they
    // don't count as available to request again.
    prisma.referralWithdrawal.aggregate({
      where: { affiliateId: affiliate.id, status: { in: ["PENDING", "APPROVED"] } },
      _sum: { amount: true },
    }),
    prisma.affiliateReferral.count({ where: { referrerId: userId } }),
    prisma.order.findMany({
      where: {
        user: { referredBy: { referrerId: userId } },
        status: { in: ["COMPLETED", "PARTIAL", "PROCESSING", "IN_PROGRESS"] },
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.referralCommission.findMany({
      where: { affiliateId: affiliate.id },
      include: {
        order: {
          include: {
            user: true,
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const rawAvailable = availableAgg._sum.amount?.toNumber() ?? 0;
  const outstandingWithdrawals = outstandingWithdrawalsAgg._sum.amount?.toNumber() ?? 0;

  return {
    referralCode: affiliate.referralCode,
    commissionRate: affiliate.commissionRate.toNumber(),
    pending: pendingAgg._sum.amount?.toNumber() ?? 0,
    available: Math.max(0, rawAvailable - outstandingWithdrawals),
    totalPaid: paidAgg._sum.amount?.toNumber() ?? 0,
    totalReferrals,
    activeReferrals: activeReferrals.length,
    history,
  };
}

export async function requestWithdrawal(userId: string, amount: number) {
  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL_USD) {
    return {
      success: false as const,
      error: `Minimum withdrawal is $${MIN_WITHDRAWAL_USD}.`,
    };
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId },
  });
  if (!affiliate) {
    return { success: false as const, error: "Affiliate profile not found." };
  }

  const summary = await getAffiliateSummary(userId);
  if (!summary || amount > summary.available) {
    return { success: false as const, error: "Amount exceeds your available balance." };
  }

  const roundedAmount = Math.round(amount * 100) / 100;

  // Note: commissions are only flipped to PAID once an admin actually pays
  // the withdrawal (see setWithdrawalStatus) — this just reserves the
  // amount by counting outstanding withdrawals against the available
  // balance (see getAffiliateSummary).
  await prisma.referralWithdrawal.create({
    data: {
      affiliateId: affiliate.id,
      amount: roundedAmount,
      status: "PENDING",
    },
  });

  return { success: true as const };
}
