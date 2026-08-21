import "server-only";

import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@/generated/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

/**
 * Deliberately NOT in a "use server" file. Every export of a "use server"
 * module becomes a client-callable RPC regardless of who's "meant" to call
 * it -- createNotification takes a bare userId with zero authorization
 * check (by design, since ~10 trusted server-side call sites need to
 * notify a *different* user than whoever is signed in, e.g. an admin
 * notifying a customer), and getMyNotifications takes an optional userId
 * override for the same reason AppShell/AdminShell already resolved one.
 * Neither of those is safe as a public RPC a client could invoke directly
 * with an arbitrary userId (see fapshi-reconcile.ts for the same pattern).
 * markNotificationRead/markAllNotificationsRead don't have this problem --
 * they always scope to the authenticated caller -- so they stay in
 * src/lib/actions/notifications.ts as real Server Actions.
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

export async function getMyNotifications(userId: string | undefined) {
  if (!userId) return { notifications: [], unreadCount: 0 };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
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
