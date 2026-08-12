"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
}

export async function updateDisplayName(name: string) {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  const trimmed = name.trim();
  if (!trimmed) return { success: false as const, error: "Name can't be empty." };

  await prisma.user.update({ where: { id: user.id }, data: { name: trimmed } });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true as const };
}
