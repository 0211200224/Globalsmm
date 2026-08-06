"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { adminServices as initialServices, type AdminService } from "./data";

const categories = ["Instagram", "TikTok", "YouTube", "Other"];

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");

  function toggleActive(id: string) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
  }

  function removeService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;
    setServices((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        pricePer1000: price.startsWith("$") ? price : `$${price}`,
        minQuantity: 100,
        maxQuantity: 10000,
        active: true,
      },
    ]);
    setName("");
    setPrice("");
    setShowForm(false);
  }

  const columns: DataTableColumn<AdminService>[] = [
    { header: "Service", render: (row) => row.name },
    {
      header: "Category",
      render: (row) => <Pill tone="info">{row.category}</Pill>,
    },
    {
      header: "Price / 1k",
      render: (row) => (
        <span className="font-mono font-bold text-secondary">
          {row.pricePer1000}
        </span>
      ),
    },
    {
      header: "Min / Max",
      render: (row) =>
        `${row.minQuantity.toLocaleString("en-US")} / ${row.maxQuantity.toLocaleString("en-US")}`,
    },
    {
      header: "Status",
      render: (row) => (
        <Pill tone={row.active ? "positive" : "neutral"}>
          {row.active ? "Active" : "Inactive"}
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
            onClick={() => toggleActive(row.id)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            {row.active ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => removeService(row.id)}
            className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="text-headline-lg text-on-surface">Services</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Catálogo, preços e disponibilidade dos serviços vendidos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-6 py-2.5 rounded-lg bg-tertiary text-on-tertiary font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Service
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-panel rounded-xl p-stack-lg grid md:grid-cols-4 gap-gutter items-end"
        >
          <div className="md:col-span-2 space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              Service name
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. LinkedIn Company Followers"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              Category
            </label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              Price / 1k (USD)
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1.20"
              inputMode="decimal"
              required
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Save Service
            </button>
          </div>
        </form>
      )}

      <DataTable
        title={`${services.length} services`}
        columns={columns}
        rows={services}
        rowKey={(row) => row.id}
      />
    </AdminShell>
  );
}
