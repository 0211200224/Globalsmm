"use server";

import crypto from "node:crypto";
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

function generateKey() {
  return `gsmm_${crypto.randomBytes(24).toString("hex")}`;
}

/**
 * Self-service — any signed-in user can generate their own API key
 * (matches how most SMM panels expose API access as a basic account
 * feature; reseller *pricing* is a separate admin-granted flag, see
 * src/lib/vip.ts and admin-users.ts).
 */
export async function ensureApiKey() {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  if (user.apiKey) return { success: true as const, apiKey: user.apiKey };

  const apiKey = generateKey();
  await prisma.user.update({ where: { id: user.id }, data: { apiKey } });

  revalidatePath("/api");
  return { success: true as const, apiKey };
}

export async function regenerateApiKey() {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  const apiKey = generateKey();
  await prisma.user.update({ where: { id: user.id }, data: { apiKey } });

  revalidatePath("/api");
  return { success: true as const, apiKey };
}
