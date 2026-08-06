export type AdminUserStatus = "active" | "blocked";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  tier: "standard" | "executive";
  walletBalance: string;
  status: AdminUserStatus;
  joinedAt: string;
};

// Placeholder roster until Fase 5 wires this up to the `User` Prisma model.
export const adminUsers: AdminUser[] = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "alex.thompson@nexusmedia.com",
    tier: "executive",
    walletBalance: "$12,450.00",
    status: "active",
    joinedAt: "Jan 14, 2025",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@viralgrowth.io",
    tier: "executive",
    walletBalance: "$3,820.50",
    status: "active",
    joinedAt: "Mar 02, 2025",
  },
  {
    id: "3",
    name: "Markus Reiner",
    email: "markus.r@nexusmedia.com",
    tier: "standard",
    walletBalance: "$140.00",
    status: "active",
    joinedAt: "Jun 21, 2025",
  },
  {
    id: "4",
    name: "unknown_reseller99",
    email: "reseller99@protonmail.com",
    tier: "standard",
    walletBalance: "$0.00",
    status: "blocked",
    joinedAt: "Jul 30, 2025",
  },
  {
    id: "5",
    name: "Alex Rivera",
    email: "alex.rivera@globalsmm.com",
    tier: "executive",
    walletBalance: "$4,822.50",
    status: "active",
    joinedAt: "Feb 09, 2025",
  },
];
