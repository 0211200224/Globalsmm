"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { adminUsers as initialUsers, type AdminUser } from "./data";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [query, setQuery] = useState("");

  function toggleBlock(id: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user,
      ),
    );
  }

  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()),
  );

  const columns: DataTableColumn<AdminUser>[] = [
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
      header: "Tier",
      render: (row) => (
        <Pill tone={row.tier === "executive" ? "info" : "neutral"}>
          {row.tier}
        </Pill>
      ),
    },
    {
      header: "Wallet",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">
          {row.walletBalance}
        </span>
      ),
    },
    { header: "Joined", render: (row) => row.joinedAt },
    {
      header: "Status",
      render: (row) => (
        <Pill tone={row.status === "active" ? "positive" : "negative"}>
          {row.status === "active" ? "Active" : "Blocked"}
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
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            Adjust Balance
          </button>
          <button
            type="button"
            onClick={() => toggleBlock(row.id)}
            className={
              row.status === "active"
                ? "px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
                : "px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-label-sm transition-colors"
            }
          >
            {row.status === "active" ? "Block" : "Unblock"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Users</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Gerencie contas, saldo e acesso dos usuários.
        </p>
      </div>

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
    </AdminShell>
  );
}
