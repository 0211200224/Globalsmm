export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: "space_dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/services", label: "Services", icon: "sell" },
  { href: "/admin/orders", label: "Orders", icon: "shopping_cart" },
  { href: "/admin/payments", label: "Payments", icon: "payments" },
];
