"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { toggleServiceActive, deleteService } from "@/lib/actions/admin-catalog";
import { CategoryManager, type EditableCategory } from "./CategoryManager";
import { ServiceFormModal, type EditableService } from "./ServiceFormModal";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";

export type AdminServiceRow = EditableService & {
  categoryName: string;
  active: boolean;
};

export function ServicesAdminView({
  services,
  categories,
  providers,
}: {
  services: AdminServiceRow[];
  categories: EditableCategory[];
  providers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useTranslations().admin.services;
  const [formTarget, setFormTarget] = useState<"new" | AdminServiceRow | null>(null);
  const [connectedOnly, setConnectedOnly] = useState(false);

  const visibleServices = connectedOnly
    ? services.filter((s) => s.providerId && s.externalServiceId)
    : services;

  async function handleToggleActive(row: AdminServiceRow) {
    await toggleServiceActive(row.id, !row.active);
    router.refresh();
  }

  async function handleDelete(row: AdminServiceRow) {
    if (!confirm(formatMessage(t.deleteConfirm, { name: row.name }))) return;
    const result = await deleteService(row.id);
    if (result.success && result.note) {
      alert(result.note);
    }
    router.refresh();
  }

  const columns: DataTableColumn<AdminServiceRow>[] = [
    {
      header: t.colService,
      render: (row) => (
        <div>
          <p className="text-body-sm font-medium text-on-surface">{row.name}</p>
          <p className="text-label-sm text-on-surface-variant">{row.serviceType}</p>
        </div>
      ),
    },
    {
      header: t.colPlatform,
      render: (row) => <Pill tone="info">{row.categoryName}</Pill>,
    },
    {
      header: t.colPrice,
      render: (row) => (
        <span className="font-mono font-bold text-secondary">
          ${row.pricePer1000.toFixed(4)}
        </span>
      ),
    },
    {
      header: t.colMinMax,
      render: (row) =>
        `${row.minQuantity.toLocaleString("en-US")} / ${row.maxQuantity.toLocaleString("en-US")}`,
    },
    {
      header: t.colStatus,
      render: (row) => (
        <Pill tone={row.active ? "positive" : "neutral"}>
          {row.active ? t.active : t.inactive}
        </Pill>
      ),
    },
    {
      header: t.colFulfillment,
      render: (row) => {
        const connected = Boolean(row.providerId && row.externalServiceId);
        return (
          <div className="flex items-center gap-2" title={connected ? t.connectedTooltip : t.manualTooltip}>
            <span
              className={
                connected
                  ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                  : "w-2 h-2 rounded-full bg-outline-variant"
              }
            />
            <span className="text-label-sm text-on-surface-variant">
              {connected ? t.connected : t.manual}
            </span>
          </div>
        );
      },
    },
    {
      header: t.colActions,
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setFormTarget(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            {t.edit}
          </button>
          <button
            type="button"
            onClick={() => handleToggleActive(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            {row.active ? t.deactivate : t.activateBtn}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
          >
            {t.remove}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="text-headline-lg text-on-surface">{t.title}</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormTarget("new")}
          className="px-6 py-2.5 rounded-lg bg-tertiary text-on-tertiary font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t.newService}
        </button>
      </div>

      <CategoryManager categories={categories} />

      <DataTable
        title={formatMessage(t.tableTitle, { visible: visibleServices.length, total: services.length })}
        action={
          <label className="flex items-center gap-2 text-label-sm text-on-surface-variant cursor-pointer select-none">
            <input
              type="checkbox"
              checked={connectedOnly}
              onChange={(e) => setConnectedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant accent-tertiary cursor-pointer"
            />
            {t.connectedOnlyLabel}
          </label>
        }
        columns={columns}
        rows={visibleServices}
        rowKey={(row) => row.id}
        emptyMessage={connectedOnly ? t.noConnected : t.noServices}
      />

      {formTarget && (
        <ServiceFormModal
          categories={categories}
          providers={providers}
          existing={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}
    </>
  );
}
