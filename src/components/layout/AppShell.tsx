import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { NotificationBell } from "./NotificationBell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getMyNotifications } from "@/lib/actions/notifications";
import { createClient } from "@/lib/supabase/server";

type AppShellProps = {
  children: ReactNode;
};

function formatRole(role: string, tier: string) {
  if (role === "ADMIN") return "Administrator";
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Tier`;
}

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  if (user?.blocked) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?blocked=1");
  }

  const userName = user?.name || user?.email || "Account";
  const userRole = user ? formatRole(user.role, user.tier) : "Member";
  const { notifications, unreadCount } = await getMyNotifications(user?.id);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-[280px] min-h-screen relative pb-20 md:pb-0">
        <TopBar
          userName={userName}
          userRole={userRole}
          notificationSlot={
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          }
        />
        <div className="p-stack-lg max-w-container-max mx-auto space-y-stack-lg">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
