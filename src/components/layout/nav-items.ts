import type { Dictionary } from "@/lib/i18n/dictionary-type";

export type NavItem = {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: string;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { href: "/services", labelKey: "marketplace", icon: "storefront" },
  { href: "/orders", labelKey: "orders", icon: "shopping_cart" },
  { href: "/wallet", labelKey: "wallet", icon: "account_balance_wallet" },
  { href: "/affiliate", labelKey: "affiliate", icon: "groups" },
  { href: "/api", labelKey: "api", icon: "code" },
  { href: "/support", labelKey: "support", icon: "support_agent" },
];

// Mobile bottom nav is deliberately curated, not a mirror of the full
// sidebar — too many icons is cramped on narrow screens. Affiliate and API
// stay reachable from the sidebar/dashboard.
export const mobileNavItems: NavItem[] = [
  navItems[0],
  navItems[1],
  navItems[2],
  navItems[3],
  navItems[6],
];
