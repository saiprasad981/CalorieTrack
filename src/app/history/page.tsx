import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { mealLogs } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <AppShell title="Meal History" description="Review your meal timeline, edit logs, and spot patterns in timing, hunger, and fullness.">
      <Card className="space-y-4">
        {mealLogs.map((meal) => (
          <div key={meal.id} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{meal.mealType}</p>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{meal.items.map((item) => item.food.name).join(", ")}</h2>
              </div>
              <p className="text-sm text-slate-500">{new Date(meal.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
