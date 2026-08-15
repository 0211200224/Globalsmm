"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] z-50 border-r border-outline-variant/10 bg-surface-container-low flex-col py-stack-xl gap-stack-md">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <span
            className="material-symbols-outlined text-on-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            cloud_done
          </span>
        </div>
        <div>
          <h1 className="text-headline-md font-bold tracking-tight text-on-surface">
            GlobalSMM
          </h1>
          <p className="text-label-sm text-on-surface-variant">
            {t.marketing.brandTagline}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-4 px-4 py-3 text-primary font-bold border-r-2 border-primary bg-primary/5 transition-all duration-200"
                  : "flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-all duration-200"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md">{t.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">
            add_circle
          </span>
          {t.nav.addFunds}
        </button>
      </div>
    </aside>
  );
}
