"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeName = "dark" | "light";

const STORAGE_KEY = "gsmm-theme";

// Kept in sync with the inline anti-flash script in layout.tsx — same
// storage key, same default.
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // Syncs React state with the data-theme attribute the anti-flash inline
    // script (layout.tsx) already set on <html> before hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(current === "light" ? "light" : "dark");
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private browsing, etc.) — theme still applies
      // for this page load, just won't persist across visits.
    }
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
