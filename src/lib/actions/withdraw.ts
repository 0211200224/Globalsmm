"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { requestWithdrawal } from "@/lib/actions/affiliate";

export async function requestWithdrawalAction(amount: number) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false as const, error: "Not authenticated." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
  });
  if (!dbUser) {
    return { success: false as const, error: "Account not found." };
  }

  const result = await requestWithdrawal(dbUser.id, amount);

  if (result.success) {
    revalidatePath("/affiliate");
  }

  return result;
}
