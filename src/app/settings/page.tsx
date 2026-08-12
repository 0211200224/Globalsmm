import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Settings</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Manage your profile, appearance, and language preferences.
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
