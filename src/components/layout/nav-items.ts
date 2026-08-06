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
];
