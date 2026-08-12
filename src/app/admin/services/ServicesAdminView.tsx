"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { toggleServiceActive, deleteService } from "@/lib/actions/admin-catalog";
import { CategoryManager, type EditableCategory } from "./CategoryManager";
import { ServiceFormModal, type EditableService } from "./ServiceFormModal";

export type AdminServiceRow = EditableService & {
  categoryName: string;
  active: boolean;
};

export function ServicesAdminView({
  services,
  categories,
}: {
  services: AdminServiceRow[];
  categories: EditableCategory[];
}) {
  const router = useRouter();
  const [formTarget, setFormTarget] = useState<"new" | AdminServiceRow | null>(null);

  async function handleToggleActive(row: AdminServiceRow) {
    await toggleServiceActive(row.id, !row.active);
    router.refresh();
  }

  async function handleDelete(row: AdminServiceRow) {
    if (!confirm(`Delete "${row.name}"?`)) return;
    const result = await deleteService(row.id);
    if (result.success && result.note) {
      alert(result.note);
    }
    router.refresh();
  }

  const columns: DataTableColumn<AdminServiceRow>[] = [
    {
      header: "Service",
      render: (row) => (
        <div>
          <p className="text-body-sm font-medium text-on-surface">{row.name}</p>
          <p className="text-label-sm text-on-surface-variant">{row.serviceType}</p>
        </div>
      ),
    },
    {
      header: "Platform",
      render: (row) => <Pill tone="info">{row.categoryName}</Pill>,
    },
    {
      header: "Price / 1k",
      render: (row) => (
        <span className="font-mono font-bold text-secondary">
          ${row.pricePer1000.toFixed(4)}
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
            onClick={() => setFormTarget(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleToggleActive(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            {row.active ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="text-headline-lg text-on-surface">Services</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Catálogo, preços e disponibilidade dos serviços vendidos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormTarget("new")}
          className="px-6 py-2.5 rounded-lg bg-tertiary text-on-tertiary font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Service
        </button>
      </div>

      <CategoryManager categories={categories} />

      <DataTable
        title={`${services.length} services`}
        columns={columns}
        rows={services}
        rowKey={(row) => row.id}
        emptyMessage="No services yet — create one to get started."
      />

      {formTarget && (
        <ServiceFormModal
          categories={categories}
          existing={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}
    </>
  );
}
