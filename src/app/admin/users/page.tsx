import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { getVipTier } from "@/lib/vip";
import { getCurrentUser } from "@/lib/actions/current-user";
import { UsersView, type AdminUserRow } from "./UsersView";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AdminUsersPage() {
  const { admin: t } = await getDictionary();
  // getCurrentUser() is wrapped in React's cache() (see current-user.ts), so
  // this resolves from memory rather than a fresh round trip — AdminShell
  // calls it too within the same request. AdminLayout has already verified
  // role === "ADMIN" before this page can render at all.
  const currentAdmin = await getCurrentUser();
  const [dbUsers, spendByUser] = await Promise.all([
    prisma.user.findMany({
      include: { wallet: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { status: { notIn: ["CANCELED", "REFUNDED"] } },
      _sum: { chargedAmount: true },
    }),
  ]);

  const spendMap = new Map(
    spendByUser.map((row) => [row.userId, row._sum.chargedAmount?.toNumber() ?? 0]),
  );

  const users: AdminUserRow[] = dbUsers.map((user) => {
    const lifetimeSpend = spendMap.get(user.id) ?? 0;
    return {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: user.role,
      vipTierName: getVipTier(lifetimeSpend).name,
      lifetimeSpend,
      isReseller: user.isReseller,
      walletBalance: user.wallet?.balance.toNumber() ?? 0,
      blocked: user.blocked,
      joinedAtLabel: user.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  });

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">{t.users.title}</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          {t.users.subtitle}
        </p>
      </div>

      <UsersView users={users} currentAdminId={currentAdmin?.id ?? ""} />
    </AdminShell>
  );
}
