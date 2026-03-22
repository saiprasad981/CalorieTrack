import { MacroChart } from "@/components/charts/macro-chart";
import { WeightChart } from "@/components/charts/weight-chart";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getRequiredUserId } from "@/lib/server-auth";
import { getWeightProgress } from "@/services/user.service";

export default async function ProgressPage() {
  const progress = await getWeightProgress(await getRequiredUserId());

  return (
    <AppShell title="Progress" description="Track weight trend, calorie consistency, macro adherence, and the overall direction of your habits.">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Weight trend</h2>
          <WeightChart data={progress.entries} />
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Macro adherence</h2>
          <MacroChart
            data={[
              { name: "Protein", value: 82 },
              { name: "Carbs", value: 74 },
              { name: "Fat", value: 69 },
              { name: "Fiber", value: 77 },
            ]}
          />
        </Card>
      </div>
    </AppShell>
  );
}
