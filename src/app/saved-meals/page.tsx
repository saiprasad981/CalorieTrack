import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { savedMeals } from "@/lib/mock-data";
import { getFeatureEngine } from "@/services/insight.service";

export default async function SavedMealsPage() {
  const features = await getFeatureEngine();

  return (
    <AppShell title="Saved Meals" description="Store real-life meals, favorite templates, and one-tap repeat options for faster logging.">
      <div className="grid gap-4 md:grid-cols-2">
        {savedMeals.map((meal) => (
          <Card key={meal.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{meal.name}</h2>
              {meal.favorite ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Favorite</span> : null}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{meal.tags.join(" | ")}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Smart repeat system</h2>
          {features.smartRepeats.map((repeat) => (
            <div key={repeat.label} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-950 dark:text-white">{repeat.label}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{repeat.meal}</p>
            </div>
          ))}
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Food intelligence score</h2>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Real-life meals keep the app useful</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Saved templates let the app remember what you actually eat and recommend higher-protein or higher-fiber swaps when needed.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Portfolio of useful habits</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{features.habitStoryRecap}</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
