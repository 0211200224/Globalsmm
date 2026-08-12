import type { ReactNode } from "react";
import Link from "next/link";

type TopBarProps = {
  userName: string;
  userRole: string;
  avatarUrl?: string;
  leftSlot?: ReactNode;
  notificationSlot?: ReactNode;
};

export function TopBar({
  userName,
  userRole,
  avatarUrl,
  leftSlot,
  notificationSlot,
}: TopBarProps) {
  return (
    <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center h-16 px-margin-x-mobile md:px-margin-x">
      <div className="flex items-center flex-1 max-w-xl">
        {leftSlot}
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container-high border-none rounded-lg pl-11 pr-4 py-2 text-body-sm focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Search services, orders, or documentation..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {notificationSlot}
          <Link
            href="/settings"
            aria-label="Settings"
            className="p-2 text-on-surface-variant hover:bg-surface-container-highest/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-outline-variant/10">
          <div className="text-right">
            <p className="text-label-md font-bold text-on-surface">
              {userName}
            </p>
            <p className="text-label-sm text-on-surface-variant">
              {userRole}
            </p>
          </div>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"
              src={avatarUrl}
              alt={userName}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-surface-container-high flex items-center justify-center text-label-md font-bold text-on-surface-variant">
              {userName.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
