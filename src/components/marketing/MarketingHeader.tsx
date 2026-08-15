"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations().marketing;

  return (
    <header className="sticky top-0 w-full z-40 backdrop-blur-md border-b border-white/5 shadow-sm bg-background/70">
      <div className="flex items-center justify-between px-margin-x-mobile md:px-margin-x h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden -ml-2 p-2 text-primary rounded-full hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
          <h1 className="text-headline-md font-bold text-primary">
            GlobalSMM
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-label-md text-primary hover:text-primary transition-colors" href="/">
            {t.navDashboard}
          </Link>
          <Link className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/services">
            {t.navServices}
          </Link>
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            {t.navApi}
          </a>
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            {t.navSupport}
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            notifications
          </span>
          <Link
            href="/login"
            className="beveled-button bg-secondary-container text-on-secondary-container px-5 py-2 rounded-lg text-label-md active:scale-95 transition-all"
          >
            {t.signIn}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col px-margin-x-mobile pb-4 gap-1 border-t border-white/5">
          <Link
            className="text-label-md text-primary py-3"
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            {t.navDashboard}
          </Link>
          <Link
            className="text-label-md text-on-surface-variant py-3"
            href="/services"
            onClick={() => setMenuOpen(false)}
          >
            {t.navServices}
          </Link>
          <a
            className="text-label-md text-on-surface-variant py-3"
            href="#"
            onClick={() => setMenuOpen(false)}
          >
            {t.navApi}
          </a>
          <a
            className="text-label-md text-on-surface-variant py-3"
            href="#"
            onClick={() => setMenuOpen(false)}
          >
            {t.navSupport}
          </a>
        </nav>
      )}
    </header>
  );
}
