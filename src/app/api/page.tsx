import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { ApiView } from "./ApiView";

export default async function ApiPage() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">API Access</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Automate orders and integrate GlobalSMM into your own tools or
          reseller panel.
        </p>
      </div>

      <ApiView initialApiKey={user?.apiKey ?? null} />
    </AppShell>
  );
}
