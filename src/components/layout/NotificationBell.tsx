"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications";
import type { NotificationRow } from "@/lib/types/notifications";

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationRow[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleOpenNotification(n: NotificationRow) {
    if (!n.read) {
      await markNotificationRead(n.id);
      router.refresh();
    }
    setOpen(false);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-on-surface-variant hover:bg-surface-container-highest/20 rounded-full transition-colors relative"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] glass-panel bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
              <h4 className="text-label-md font-bold text-on-surface">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-label-sm text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant text-center py-8 px-4">
                  You&apos;re all caught up.
                </p>
              ) : (
                notifications.map((n) => {
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-label-md font-medium text-on-surface">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">
                        {n.body}
                      </p>
                      <p className="text-label-sm text-on-surface-variant/60 mt-1">
                        {n.createdAtLabel}
                      </p>
                    </>
                  );

                  return n.link ? (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => handleOpenNotification(n)}
                      className={`block px-4 py-3 border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-high transition-colors ${
                        n.read ? "" : "bg-primary/5"
                      }`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleOpenNotification(n)}
                      className={`w-full text-left px-4 py-3 border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-high transition-colors ${
                        n.read ? "" : "bg-primary/5"
                      }`}
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
