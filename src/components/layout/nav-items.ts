export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/services", label: "Marketplace", icon: "storefront" },
  { href: "/orders", label: "Orders", icon: "shopping_cart" },
  { href: "/wallet", label: "Wallet", icon: "account_balance_wallet" },
  { href: "/affiliate", label: "Affiliate", icon: "groups" },
  { href: "/api", label: "API", icon: "code" },
  { href: "/support", label: "Support", icon: "support_agent" },
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
