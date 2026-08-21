import type { Dictionary } from "@/lib/i18n/dictionary-type";

export type AdminNavItem = {
  href: string;
  labelKey: keyof Dictionary["admin"]["nav"];
  icon: string;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", labelKey: "overview", icon: "space_dashboard" },
  { href: "/admin/users", labelKey: "users", icon: "group" },
  { href: "/admin/services", labelKey: "services", icon: "sell" },
  { href: "/admin/orders", labelKey: "orders", icon: "shopping_cart" },
  { href: "/admin/providers", labelKey: "providers", icon: "dns" },
  { href: "/admin/payments", labelKey: "payments", icon: "payments" },
  { href: "/admin/withdrawals", labelKey: "withdrawals", icon: "account_balance" },
  { href: "/admin/support", labelKey: "support", icon: "support_agent" },
];
