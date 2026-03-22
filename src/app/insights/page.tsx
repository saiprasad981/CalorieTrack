import { InsightsClient } from "@/components/insights/insights-client";
import { AppShell } from "@/components/layout/app-shell";

export default function InsightsPage() {
  return (
    <AppShell
      title="Insights"
      description="Rule-based nutrition and behavior insights for satiety, sleep, cravings, hidden calories, meal quality, and decision support."
    >
      <InsightsClient />
    </AppShell>
  );
}
