"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "./nav-items";

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="p-2 -ml-2 mr-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-highest/20 transition-colors"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-[280px] h-screen bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-stack-xl gap-stack-md">
            <div className="px-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-on-tertiary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shield_person
                  </span>
                </div>
                <div>
                  <h1 className="text-headline-md font-bold tracking-tight text-on-surface">
                    GlobalSMM
                  </h1>
                  <p className="text-label-sm text-tertiary font-bold uppercase tracking-widest">
                    Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {adminNavItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "flex items-center gap-4 px-4 py-3 text-tertiary font-bold border-r-2 border-tertiary bg-tertiary/5 transition-all duration-200"
                        : "flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-surface-container-high hover:text-on-surface transition-all duration-200"
                    }
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="text-label-md">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-6 mt-auto">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>
                Exit Admin
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
