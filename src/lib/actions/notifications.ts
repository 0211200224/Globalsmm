"use server";

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

export async function markNotificationRead(id: string) {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });

  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const user = await getRequester();
  if (!user) return { success: false as const, error: "You must be signed in." };

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  return { success: true as const };
}
