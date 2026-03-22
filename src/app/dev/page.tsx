import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

const endpoints = [
  "/api/dashboard/today",
  "/api/foods/search?query=chicken",
  "/api/meals",
  "/api/insights/weekly",
  "/api/progress/weight",
];

export default function DevPage() {
  return (
    <AppShell title="Developer Utility" description="Internal testing surface for API health, seeded data, and diagnostics while the product evolves.">
      <Card className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 font-mono text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            {endpoint}
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
