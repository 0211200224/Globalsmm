import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { TopBar } from "@/components/layout/TopBar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="md:ml-[280px] min-h-screen relative">
        <TopBar userName="Alex Thompson" userRole="Administrator" />
        <div className="p-stack-lg max-w-container-max mx-auto space-y-stack-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
