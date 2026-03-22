import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" description="Theme, notifications, units, privacy, and future integration settings live here.">
      <SettingsForm />
    </AppShell>
  );
}
