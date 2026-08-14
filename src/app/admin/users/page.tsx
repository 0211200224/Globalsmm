import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { getVipTier } from "@/lib/vip";
import { UsersView, type AdminUserRow } from "./UsersView";

export default async function AdminUsersPage() {
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
        <h2 className="text-headline-lg text-on-surface">Users</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Gerencie contas, saldo e acesso dos usuários.
        </p>
      </div>

      <UsersView users={users} />
    </AdminShell>
  );
}
