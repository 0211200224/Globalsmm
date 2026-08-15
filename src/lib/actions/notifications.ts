"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType, Prisma } from "@/generated/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

/**
 * Called from other server actions (order status changes, support replies,
 * referral commissions, withdrawals) to fan out an in-app notification.
 * Accepts an optional transaction client so callers already inside a
 * `prisma.$transaction` can keep the write atomic with the rest of the
 * operation.
 */
export async function createNotification(
  data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string | null;
  },
  client: DbClient = prisma,
) {
  await client.notification.create({
    data: { ...data, link: data.link ?? null },
  });
}

async function getRequester() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
}

/**
 * Accepts an already-known userId (AppShell/AdminShell already called the
 * cached getCurrentUser()) to skip a redundant Supabase + Prisma user
 * lookup. Falls back to resolving it from the session when omitted.
 */
export async function getMyNotifications(userId?: string) {
  const resolvedUserId = userId ?? (await getRequester())?.id;
  if (!resolvedUserId) return { notifications: [], unreadCount: 0 };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: resolvedUserId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: resolvedUserId, read: false } }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAtLabel: n.createdAt.toLocaleString("en-US"),
    })),
    unreadCount,
  };
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
