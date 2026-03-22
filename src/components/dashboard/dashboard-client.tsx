"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Droplets, Flame, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  buildWhatToEatNext,
  calculateCaloriesRemaining,
  calculateMealQuality,
  calculateMealTotals,
  calculateSatietyScore,
  getCalorieTargetForDate,
  scaleFood,
} from "@/lib/calculations";
import {
  getStoredDailyLog,
  getStoredMealDraft,
  getStoredMealLogs,
  getStoredProfile,
  type StoredMealDraft,
} from "@/lib/client-persistence";
import { dailyLog as demoDailyLog, demoUser, mealLogs as demoMealLogs } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import type { MealLog } from "@/types/meal";
import type { DailyLog, UserProfile } from "@/types/user";

function getMealHealthEffect(meal: MealLog) {
  if ((meal.totalProtein >= 25 && meal.totalFiber >= 8) || (meal.satietyScore ?? 0) >= 75) {
    return {
      label: "High satiety",
      impact: "Supports fullness, steadier energy, and easier calorie control.",
    };
  }

  if (meal.items.some((item) => (item.food.sugar ?? 0) >= 12)) {
    return {
      label: "Quick energy",
      impact: "Might feel energizing now but could fade sooner if protein and fiber stay low.",
    };
  }

  if (meal.totalCalories > 500 && meal.totalFat > 18) {
    return {
      label: "Heavy meal",
      impact: "Likely filling, but can feel sluggish if the rest of the day is sedentary.",
    };
  }

  return {
    label: "Balanced support",
    impact: "Reasonably supports energy and fits a sustainable nutrition plan.",
  };
}

export function DashboardClient() {
  const [profile, setProfile] = useState<UserProfile>(demoUser);
  const [dailyLog, setDailyLog] = useState<DailyLog>(demoDailyLog);
  const [meals, setMeals] = useState<MealLog[]>(demoMealLogs);
  const [draft, setDraft] = useState<StoredMealDraft | null>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      setProfile(getStoredProfile());
      setDailyLog(getStoredDailyLog());
      setMeals(getStoredMealLogs());
      setDraft(
        getStoredMealDraft({
          mealType: "breakfast",
          hungerBefore: 5,
          fullnessAfter: 6,
          mood: "energized",
          stressLevel: 3,
          notes: "",
          selectedFoodId: "",
          quantity: 100,
          draftItems: [],
        }),
      );
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("calorietrack:meal-logs-updated", syncFromStorage);
    window.addEventListener("calorietrack:profile-updated", syncFromStorage);
    window.addEventListener("calorietrack:daily-log-updated", syncFromStorage);
    window.addEventListener("calorietrack:meal-draft-updated", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("calorietrack:meal-logs-updated", syncFromStorage);
      window.removeEventListener("calorietrack:profile-updated", syncFromStorage);
      window.removeEventListener("calorietrack:daily-log-updated", syncFromStorage);
      window.removeEventListener("calorietrack:meal-draft-updated", syncFromStorage);
    };
  }, []);

  const draftPreviewMeal = useMemo(() => {
    if (!draft?.draftItems?.length) {
      return null;
    }

    const items = draft.draftItems.map((item) => scaleFood(item.food, item.quantity));
    const totals = calculateMealTotals(items);

    const preview: MealLog = {
      id: "current-draft",
      userId: profile.id,
      date: new Date().toISOString(),
      mealType: draft.mealType,
      items,
      totalCalories: Number(totals.totalCalories.toFixed(1)),
      totalProtein: Number(totals.totalProtein.toFixed(1)),
      totalCarbs: Number(totals.totalCarbs.toFixed(1)),
      totalFat: Number(totals.totalFat.toFixed(1)),
      totalFiber: Number(totals.totalFiber.toFixed(1)),
      protein: Number(totals.totalProtein.toFixed(1)),
      carbs: Number(totals.totalCarbs.toFixed(1)),
      fat: Number(totals.totalFat.toFixed(1)),
      fiber: Number(totals.totalFiber.toFixed(1)),
      hungerBefore: draft.hungerBefore,
      fullnessAfter: draft.fullnessAfter,
      mood: draft.mood,
      stressLevel: draft.stressLevel,
      notes: draft.notes,
    };

    preview.qualityScore = calculateMealQuality(preview);
    preview.satietyScore = calculateSatietyScore(preview);
    return preview;
  }, [draft, profile.id]);

  const todayMeals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return meals.filter((meal) => meal.date.slice(0, 10) === today);
  }, [meals]);

  const combinedMeals = useMemo(() => {
    return draftPreviewMeal ? [draftPreviewMeal, ...todayMeals] : todayMeals;
  }, [draftPreviewMeal, todayMeals]);

  const totals = useMemo(() => {
    return combinedMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.protein += meal.totalProtein;
        acc.carbs += meal.totalCarbs;
        acc.fat += meal.totalFat;
        acc.fiber += meal.totalFiber;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
  }, [combinedMeals]);

  const target = useMemo(
    () => getCalorieTargetForDate(profile.flexibleBudget, profile.dailyCalories, new Date()),
    [profile.dailyCalories, profile.flexibleBudget],
  );

  const remaining = calculateCaloriesRemaining(totals.calories, target);
  const whatToEatNext = buildWhatToEatNext(profile, totals);

  const mealPeriodSummary = useMemo(() => {
    return ["breakfast", "lunch", "snack", "dinner"].map((period) => {
      const meal =
        combinedMeals.find((entry) => entry.id === "current-draft" && entry.mealType === period) ??
        combinedMeals.find((entry) => entry.mealType === period);

      if (!meal) {
        return {
          period,
          tracked: false,
          title: `No ${period} logged yet`,
          summary: "Track this meal to see how it affects your dashboard totals and guidance.",
        };
      }

      const healthEffect = getMealHealthEffect(meal);

      return {
        period,
        tracked: true,
        title: meal.items.map((item) => item.food.name).join(", "),
        summary: healthEffect.impact,
        label: healthEffect.label,
        calories: meal.totalCalories,
      };
    });
  }, [combinedMeals]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <Flame className="h-5 w-5 text-orange-500" />
            <p className="mt-3 text-sm text-slate-500">Calories</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
              {formatNumber(totals.calories)}
            </p>
          </Card>
          <Card>
            <Activity className="h-5 w-5 text-blue-600" />
            <p className="mt-3 text-sm text-slate-500">Calories left</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
              {formatNumber(remaining)}
            </p>
          </Card>
          <Card>
            <Droplets className="h-5 w-5 text-cyan-500" />
            <p className="mt-3 text-sm text-slate-500">Water</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
              {dailyLog.waterIntake} ml
            </p>
          </Card>
          <Card>
            <Sparkles className="h-5 w-5 text-violet-500" />
            <p className="mt-3 text-sm text-slate-500">Sleep</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
              {dailyLog.sleepHours}h
            </p>
          </Card>
        </div>

        <Card className="space-y-5">
          <div>
            <p className="text-sm text-slate-500">Macro summary</p>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Protein, carbs, fats, and fiber
            </h2>
          </div>
          {[
            ["Protein", totals.protein, profile.macroTargets.protein],
            ["Carbs", totals.carbs, profile.macroTargets.carbs],
            ["Fat", totals.fat, profile.macroTargets.fat],
            ["Fiber", totals.fiber, profile.macroTargets.fiber],
          ].map(([label, value, target]) => (
            <div key={String(label)} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{label}</span>
                <span>
                  {Math.round(value as number)} / {target as number}
                </span>
              </div>
              <ProgressBar value={((value as number) / (target as number)) * 100} />
            </div>
          ))}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Current meal draft
          </h2>
          {!draftPreviewMeal ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Nothing is in your current draft yet. Add food on the meals page and it will show up here immediately.
            </div>
          ) : (
            <div className="space-y-3">
              {draftPreviewMeal.items.map((item, index) => (
                <div
                  key={`${item.food.id}-${index}`}
                  className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {item.food.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.quantity}
                    {item.unit} | {Math.round(item.calories)} kcal
                  </p>
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-sm text-slate-500">Calories</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    {Math.round(draftPreviewMeal.totalCalories)}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-sm text-slate-500">Protein</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    {Math.round(draftPreviewMeal.totalProtein)}g
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-sm text-slate-500">Fiber</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    {Math.round(draftPreviewMeal.totalFiber)}g
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                    Draft preview
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Meal timeline
          </h2>
          {combinedMeals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No meals or draft added yet today. Add food on the meals page and your dashboard totals will update here.
            </div>
          ) : (
            <div className="space-y-3">
              {combinedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                        {meal.mealType} {meal.id === "current-draft" ? "· draft" : ""}
                      </p>
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">
                        {meal.items.map((item) => item.food.name).join(", ")}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {Math.round(meal.totalCalories)} kcal
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Hunger {meal.hungerBefore ?? "-"}/10</span>
                    <span>Fullness {meal.fullnessAfter ?? "-"}/10</span>
                    <span>Quality {meal.qualityScore ?? "-"}</span>
                    <span>Satiety {meal.satietyScore ?? "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Breakfast, lunch, snacks, dinner health effects
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {mealPeriodSummary.map((meal) => (
              <div
                key={meal.period}
                className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    {meal.period}
                  </p>
                  {meal.tracked ? (
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      {meal.label}
                    </p>
                  ) : null}
                </div>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {meal.title}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {meal.summary}
                </p>
                {"calories" in meal ? (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {Math.round(meal.calories ?? 0)} kcal
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5">
        <Card className="space-y-3">
          <p className="text-sm text-slate-500">What to eat next</p>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            {whatToEatNext}
          </h2>
        </Card>
        <Card className="space-y-3">
          <p className="text-sm text-slate-500">Dashboard note</p>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            Calories, remaining budget, macro progress, and the meal timeline now include your current meal draft as well as saved meals.
          </p>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            Draft rows are shown as live preview entries. Press <span className="font-medium">Save meal log</span> when you want to convert the draft into a permanent meal log.
          </p>
        </Card>
      </div>
    </div>
  );
}
