import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardQuote } from "@/components/dashboard/dashboard-quote";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" headerContent={<DashboardQuote />} showAccountMenu>
      <DashboardClient />
    </AppShell>
  );
}
