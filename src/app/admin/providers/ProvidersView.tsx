"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { toggleProviderActive, syncProviderBalance } from "@/lib/actions/admin-providers";
import { ProviderFormModal, type EditableProvider } from "./ProviderFormModal";
import { ProviderCatalogModal } from "./ProviderCatalogModal";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";

export type AdminProviderRow = {
  id: string;
  name: string;
  apiUrl: string;
  balance: string | null;
  active: boolean;
  serviceCount: number;
  orderCount: number;
  createdAtLabel: string;
};

export function ProvidersView({ providers }: { providers: AdminProviderRow[] }) {
  const router = useRouter();
  const t = useTranslations().admin.providers;
  const [isPending, startTransition] = useTransition();
  const [formTarget, setFormTarget] = useState<"new" | EditableProvider | null>(null);
  const [catalogTarget, setCatalogTarget] = useState<AdminProviderRow | null>(null);

  function handleToggleActive(row: AdminProviderRow) {
    startTransition(async () => {
      await toggleProviderActive(row.id, !row.active);
      router.refresh();
    });
  }

  function handleSyncBalance(row: AdminProviderRow) {
    startTransition(async () => {
      const result = await syncProviderBalance(row.id);
      if (!result.success) alert(result.error);
      router.refresh();
    });
  }

  const columns: DataTableColumn<AdminProviderRow>[] = [
    {
      header: t.colProvider,
      render: (row) => (
        <div>
          <p className="text-body-sm font-medium text-on-surface">{row.name}</p>
          <p className="text-label-sm text-on-surface-variant font-mono">{row.apiUrl}</p>
        </div>
      ),
    },
    {
      header: t.colBalance,
      render: (row) =>
        row.balance ? (
          <span className="font-mono font-bold text-secondary">{row.balance}</span>
        ) : (
          <span className="text-label-sm text-on-surface-variant/50">{t.notSynced}</span>
        ),
    },
    {
      header: t.colMapped,
      render: (row) => (
        <span className="text-label-sm text-on-surface-variant">
          {row.serviceCount === 1
            ? formatMessage(t.mappedOne, { orders: row.orderCount, oSuffix: row.orderCount === 1 ? "" : "s" })
            : formatMessage(t.mappedLabel, {
                services: row.serviceCount,
                orders: row.orderCount,
                oSuffix: row.orderCount === 1 ? "" : "s",
              })}
        </span>
      ),
    },
    {
      header: t.colStatus,
      render: (row) => (
        <Pill tone={row.active ? "positive" : "neutral"}>{row.active ? t.active : t.inactive}</Pill>
      ),
    },
    {
      header: t.colActions,
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSyncBalance(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors disabled:opacity-50"
          >
            {t.syncBalance}
          </button>
          <button
            type="button"
            onClick={() => setCatalogTarget(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            {t.viewCatalog}
          </button>
          <button
            type="button"
            onClick={() => setFormTarget(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
          >
            {t.edit}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleToggleActive(row)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors disabled:opacity-50"
          >
            {row.active ? t.deactivate : t.activate}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setFormTarget("new")}
          className="px-6 py-2.5 rounded-lg bg-tertiary text-on-tertiary font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t.newProvider}
        </button>
      </div>

      <DataTable
        title={formatMessage(t.tableTitle, { count: providers.length })}
        columns={columns}
        rows={providers}
        rowKey={(row) => row.id}
        emptyMessage={t.noProviders}
      />

      {formTarget && (
        <ProviderFormModal
          existing={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {catalogTarget && (
        <ProviderCatalogModal
          providerId={catalogTarget.id}
          providerName={catalogTarget.name}
          onClose={() => setCatalogTarget(null)}
        />
      )}
    </>
  );
}
