import { HeaderControls } from "@/components/layout/HeaderControls";

/**
 * login/register render their own <main> (no AppShell/TopBar), so theme +
 * language controls would otherwise only exist buried in Settings, after
 * signing in. This puts them somewhere visible from the very first screen.
 */
export function AuthTopBar() {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-end items-center h-14 px-4 bg-surface/70 backdrop-blur-md border-b border-outline-variant/10">
      <HeaderControls />
    </div>
  );
}
