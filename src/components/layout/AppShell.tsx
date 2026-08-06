import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { getCurrentUser } from "@/lib/actions/current-user";

type AppShellProps = {
  children: ReactNode;
};

function formatRole(role: string, tier: string) {
  if (role === "ADMIN") return "Administrator";
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Tier`;
}

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  const userName = user?.name || user?.email || "Account";
  const userRole = user ? formatRole(user.role, user.tier) : "Member";

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-[280px] min-h-screen relative pb-20 md:pb-0">
        <TopBar userName={userName} userRole={userRole} />
        <div className="p-stack-lg max-w-container-max mx-auto space-y-stack-lg">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
