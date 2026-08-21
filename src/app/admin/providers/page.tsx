import { AdminShell } from "@/components/admin/AdminShell";
import { listProviders } from "@/lib/actions/admin-providers";
import { formatUSD } from "@/lib/format";
import { ProvidersView, type AdminProviderRow } from "./ProvidersView";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AdminProvidersPage() {
  const { admin: t } = await getDictionary();
  const dbProviders = await listProviders();

  const providers: AdminProviderRow[] = dbProviders.map((p) => ({
    id: p.id,
    name: p.name,
    apiUrl: p.apiUrl,
    balance: p.balance != null ? formatUSD(p.balance.toNumber()) : null,
    active: p.active,
    serviceCount: p._count.services,
    orderCount: p._count.orders,
    createdAtLabel: p.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">{t.providers.title}</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          {t.providers.subtitle}
        </p>
      </div>

      <ProvidersView providers={providers} />
    </AdminShell>
  );
}
