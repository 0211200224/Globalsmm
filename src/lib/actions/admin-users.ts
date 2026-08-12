"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertIsAdmin } from "@/lib/actions/admin-guard";

export async function setUserBlocked(userId: string, blocked: boolean) {
  const admin = await assertIsAdmin();
  if (admin.id === userId) {
    return { success: false as const, error: "You can't block your own account." };
  }

  await prisma.user.update({ where: { id: userId }, data: { blocked } });
  revalidatePath("/admin/users");
  return { success: true as const };
}

export async function adjustWalletBalance(userId: string, amount: number) {
  await assertIsAdmin();

  if (!Number.isFinite(amount) || amount === 0) {
    return { success: false as const, error: "Enter a non-zero amount." };
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return { success: false as const, error: "This user has no wallet yet." };

  const rounded = Math.round(amount * 100) / 100;

  if (rounded < 0 && wallet.balance.toNumber() + rounded < 0) {
    return { success: false as const, error: "Adjustment would make the balance negative." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: rounded } },
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: rounded > 0 ? "DEPOSIT" : "DEBIT",
        status: "COMPLETED",
        amount: Math.abs(rounded),
        method: "admin_adjustment",
      },
    });
  });

  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  return { success: true as const };
}
