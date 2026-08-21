import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileNav } from "./AdminMobileNav";
import { TopBar } from "@/components/layout/TopBar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getMyNotifications } from "@/lib/notifications-core";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminShellProps = {
  children: ReactNode;
};

export async function AdminShell({ children }: AdminShellProps) {
  const user = await getCurrentUser();
  const { notifications, unreadCount } = await getMyNotifications(user?.id);
  const { admin: t } = await getDictionary();

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="md:ml-[280px] min-h-screen relative">
        <TopBar
          userName={user?.name || user?.email || t.shellFallbackName}
          userRole={t.shellRole}
          leftSlot={<AdminMobileNav />}
          notificationSlot={
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          }
        />
        <div className="p-stack-lg max-w-container-max mx-auto space-y-stack-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
