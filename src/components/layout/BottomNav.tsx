"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "./nav-items";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 backdrop-blur-xl bg-surface/80 border-t border-white/5 shadow-[0_-4px_10px_rgba(0,0,0,0.3)] flex justify-around items-center h-16 px-4">
      {mobileNavItems.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "flex-1 min-w-0 flex flex-col items-center gap-1 text-primary"
                : "flex-1 min-w-0 flex flex-col items-center gap-1 text-on-surface-variant"
            }
          >
            <span className="material-symbols-outlined text-[22px]">
              {item.icon}
            </span>
            <span className="text-[10px] font-medium truncate max-w-full">
              {t.nav[item.labelKey]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
