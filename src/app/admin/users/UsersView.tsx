"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import {
  setUserBlocked,
  setUserReseller,
  setUserRole,
  adjustWalletBalance,
} from "@/lib/actions/admin-users";
import { formatUSD } from "@/lib/format";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  vipTierName: string;
  lifetimeSpend: number;
  isReseller: boolean;
  walletBalance: number;
  blocked: boolean;
  joinedAtLabel: string;
};

export function UsersView({
  users,
  currentAdminId,
}: {
  users: AdminUserRow[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleToggleBlock(user: AdminUserRow) {
    const result = await setUserBlocked(user.id, !user.blocked);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handleToggleReseller(user: AdminUserRow) {
    await setUserReseller(user.id, !user.isReseller);
    router.refresh();
  }

  async function handleToggleRole(user: AdminUserRow) {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`${nextRole === "ADMIN" ? "Grant" : "Remove"} admin access for ${user.name}?`)) {
      return;
    }
    const result = await setUserRole(user.id, nextRole);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAdjustBalance(user: AdminUserRow) {
    const input = prompt(
      `Adjust wallet for ${user.name} (current: ${formatUSD(user.walletBalance)}).\nEnter amount (use a negative number to debit):`,
    );
    if (input === null) return;
    const amount = Number(input);
    setAdjustingId(user.id);
    const result = await adjustWalletBalance(user.id, amount);
    setAdjustingId(null);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  const columns: DataTableColumn<AdminUserRow>[] = [
    {
      header: "User",
      render: (row) => (
        <div>
          <p className="text-body-sm font-medium text-on-surface">
            {row.name}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {row.email}
          </p>
        </div>
      ),
    },
    {
      header: "Role / Tier",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill tone={row.role === "ADMIN" ? "info" : "neutral"}>
            {row.role === "ADMIN" ? "Admin" : row.vipTierName}
          </Pill>
          {row.isReseller && <Pill tone="warning">Reseller</Pill>}
        </div>
      ),
    },
    {
      header: "Lifetime Spend",
      render: (row) => (
        <span className="font-mono text-on-surface-variant">
          {formatUSD(row.lifetimeSpend)}
        </span>
      ),
    },
    {
      header: "Wallet",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">
          {formatUSD(row.walletBalance)}
        </span>
      ),
    },
    { header: "Joined", render: (row) => row.joinedAtLabel },
    {
      header: "Status",
      render: (row) => (
        <Pill tone={row.blocked ? "negative" : "positive"}>
          {row.blocked ? "Blocked" : "Active"}
        </Pill>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={adjustingId === row.id}
            onClick={() => handleAdjustBalance(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors disabled:opacity-50"
          >
            Adjust Balance
          </button>
          <button
            type="button"
            disabled={row.id === currentAdminId}
            onClick={() => handleToggleRole(row)}
            className={
              row.role === "ADMIN"
                ? "px-3 py-1.5 rounded-lg border border-secondary/30 text-secondary hover:bg-secondary/10 text-label-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                : "px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {row.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
          </button>
          <button
            type="button"
            onClick={() => handleToggleReseller(row)}
            className={
              row.isReseller
                ? "px-3 py-1.5 rounded-lg border border-tertiary/30 text-tertiary hover:bg-tertiary/10 text-label-sm transition-colors"
                : "px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
            }
          >
            {row.isReseller ? "Remove Reseller" : "Make Reseller"}
          </button>
          <button
            type="button"
            onClick={() => handleToggleBlock(row)}
            className={
              !row.blocked
                ? "px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
                : "px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-label-sm transition-colors"
            }
          >
            {!row.blocked ? "Block" : "Unblock"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title={`${filtered.length} usuários`}
      action={
        <input
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-4 py-1.5 focus:ring-1 focus:ring-tertiary w-56"
          placeholder="Search by name or email..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
      columns={columns}
      rows={filtered}
      rowKey={(row) => row.id}
    />
  );
}
