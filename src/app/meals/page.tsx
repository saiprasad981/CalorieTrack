import { AppShell } from "@/components/layout/app-shell";
import { MealWorkbench } from "@/components/meals/meal-workbench";
import { foodLibrary } from "@/lib/mock-data";
import { getFeatureEngine } from "@/services/insight.service";

export default async function MealsPage() {
  const features = await getFeatureEngine();

  return (
    <AppShell title="Add Meal" description="Search foods, build breakfast/lunch/snack/dinner logs, track hunger and mood, and get healthier meal guidance instantly.">
      <MealWorkbench
        foods={foodLibrary}
        proteinSuggestion={features.proteinGapCoach.suggestion}
        fiberSuggestion={features.fiberRecoveryMode.suggestion}
      />
    </AppShell>
  );
}
