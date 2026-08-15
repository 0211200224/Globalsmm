import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const { settings: t } = await getDictionary();

  return (
    <AppShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">{t.title}</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          {t.subtitle}
        </p>
      </div>

      <SettingsView
        name={user?.name ?? ""}
        email={user?.email ?? ""}
        tier={user?.tier ?? "standard"}
      />
    </AppShell>
  );
}
