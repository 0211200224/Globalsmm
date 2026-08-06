import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { formatUSD } from "@/lib/format";
import { WalletView } from "./WalletView";

export default async function WalletPage() {
  const user = await getCurrentUser();
  const balance = formatUSD(user?.wallet?.balance.toNumber() ?? 0);

  return (
    <AppShell>
      <WalletView balance={balance} />
    </AppShell>
  );
}
