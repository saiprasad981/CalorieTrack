"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import {
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
import {
  dailyLog as demoDailyLog,
  demoUser,
  mealLogs as demoMealLogs,
} from "@/lib/mock-data";
import type { MealLog } from "@/types/meal";
import type { DailyLog, UserProfile } from "@/types/user";

function buildDraftPreviewMeal(draft: StoredMealDraft | null, userId: string) {
  if (!draft?.draftItems?.length) {
    return null;
  }

  const items = draft.draftItems.map((item) => scaleFood(item.food, item.quantity));
  const totals = calculateMealTotals(items);

  const preview: MealLog = {
    id: "current-draft",
    userId,
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
}

function getHiddenCalorieAlerts(meals: MealLog[]) {
  return meals
    .flatMap((meal) =>
      meal.items
        .filter((item) => /(latte|sauce|oil|fried|sweet|sugary|drink|coffee)/i.test(item.food.name))
        .map((item) => ({
          mealId: meal.id,
          name: item.food.name,
          reason:
            (item.food.sugar ?? 0) > 15
              ? "High liquid sugar density"
              : "Often undercounted add-on calories",
        })),
    )
    .slice(0, 4);
}

export function InsightsClient() {
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

  const todayMeals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return meals.filter((meal) => meal.date.slice(0, 10) === today);
  }, [meals]);

  const draftPreviewMeal = useMemo(
    () => buildDraftPreviewMeal(draft, profile.id),
    [draft, profile.id],
  );

  const combinedMeals = useMemo(
    () => (draftPreviewMeal ? [draftPreviewMeal, ...todayMeals] : todayMeals),
    [draftPreviewMeal, todayMeals],
  );

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

  const hiddenAlerts = useMemo(() => getHiddenCalorieAlerts(combinedMeals), [combinedMeals]);

  const satietyRanking = useMemo(() => {
    return combinedMeals
      .map((meal) => ({
        id: meal.id,
        name: meal.items.map((item) => item.food.name).join(", "),
        score: meal.satietyScore ?? 0,
        quality: meal.qualityScore ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [combinedMeals]);

  const target = useMemo(
    () => getCalorieTargetForDate(profile.flexibleBudget, profile.dailyCalories, new Date()),
    [profile.dailyCalories, profile.flexibleBudget],
  );

  const dailyInsights = useMemo(() => {
    const feed = [];

    if (dailyLog.sleepHours < 6) {
      feed.push({
        id: "sleep",
        title: "Sleep is nudging snack calories up",
        message: `You slept ${dailyLog.sleepHours}h, which usually increases fast-energy snack cravings. A protein-forward afternoon snack can reduce that swing.`,
      });
    }

    const bestMeal = satietyRanking[0];
    if (bestMeal) {
      feed.push({
        id: "satiety",
        title: `${bestMeal.name} is your best fullness-per-calorie meal`,
        message: "Meals with protein plus fiber are giving you steadier energy and stronger appetite control than sugary or liquid snacks.",
      });
    }

    if (hiddenAlerts[0]) {
      feed.push({
        id: "hidden",
        title: "Hidden calories detected",
        message: `${hiddenAlerts[0].name} is adding more quiet calories than it seems. A lower-sugar swap would make the day easier to manage.`,
      });
    }

    if (feed.length === 0) {
      feed.push({
        id: "steady",
        title: "Your day is looking fairly balanced",
        message: "Keep protein, fiber, and hydration steady and your next meal can stay simple rather than corrective.",
      });
    }

    return feed;
  }, [dailyLog.sleepHours, hiddenAlerts, satietyRanking]);

  const proteinRemaining = Math.max(profile.macroTargets.protein - totals.protein, 0);
  const fiberRemaining = Math.max(profile.macroTargets.fiber - totals.fiber, 0);

  const consistencyScore = useMemo(() => {
    let score = 50;
    if (totals.protein >= profile.macroTargets.protein * 0.8) score += 15;
    if (totals.fiber >= profile.macroTargets.fiber * 0.7) score += 10;
    if (dailyLog.waterIntake >= profile.waterTarget * 0.7) score += 10;
    if (combinedMeals.length >= 3) score += 10;
    if (dailyLog.sleepHours >= 6) score += 5;

    const clamped = Math.max(0, Math.min(100, score));
    return {
      score: clamped,
      label: clamped >= 80 ? "Consistent, not perfect" : "Good momentum with room to tighten up",
      message:
        clamped >= 80
          ? "Protein, water, and meal timing are trending in the right direction even when calories fluctuate."
          : "A bit more sleep, hydration, or fiber would make the day feel steadier and easier to sustain.",
    };
  }, [combinedMeals.length, dailyLog.sleepHours, dailyLog.waterIntake, profile.macroTargets.fiber, profile.macroTargets.protein, profile.waterTarget, totals.fiber, totals.protein]);

  const lateNightRisk = dailyLog.sleepHours < 6 || (hiddenAlerts.length > 0 && totals.fiber < profile.macroTargets.fiber * 0.6) ? "medium" : "low";

  const budgetDelta = target - totals.calories;

  const smartSwap = hiddenAlerts[0]
    ? {
        current: hiddenAlerts[0].name,
        better: "Cold brew with milk + protein yogurt",
        impact: "Roughly 90 fewer calories with stronger satiety and more protein.",
      }
    : {
        current: "Sugary snack",
        better: "Fruit + yogurt or roasted chickpeas",
        impact: "Better fiber, better fullness, and fewer empty calories.",
      };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Daily insight feed</h2>
          {dailyInsights.map((insight) => (
            <div key={insight.id} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-950 dark:text-white">{insight.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{insight.message}</p>
            </div>
          ))}
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Satiety and meal quality</h2>
          {satietyRanking.map((meal) => (
            <div key={meal.id} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950 dark:text-white">{meal.name}</p>
                <p className="text-sm text-slate-500">Satiety {meal.score} | Quality {meal.quality}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Craving trigger map</h2>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Low sleep + stress</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {dailyLog.sleepHours}h sleep and stress {dailyLog.stressLevel}/10 make quick-energy foods more tempting.
            </p>
            <p className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300">Add a planned protein snack on lower-sleep days.</p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Meal gap pressure</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Long gaps between meals make it easier to reach for sugary or liquid calories later.
            </p>
            <p className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300">Use a bridge snack or earlier meal on busy days.</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Hidden calorie detector</h2>
          {hiddenAlerts.length ? hiddenAlerts.map((alert) => (
            <div key={`${alert.mealId}-${alert.name}`} className="rounded-3xl border border-amber-200/70 bg-amber-50/80 p-4 dark:border-amber-900/70 dark:bg-amber-950/20">
              <p className="font-semibold text-slate-950 dark:text-white">{alert.name}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{alert.reason}</p>
            </div>
          )) : (
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              No obvious hidden-calorie foods are standing out right now.
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Consistency score</h2>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-4xl font-semibold text-slate-950 dark:text-white">{consistencyScore.score}</p>
            <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{consistencyScore.label}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{consistencyScore.message}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Behavior engine</h2>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">
              {dailyLog.sleepHours < 6 ? "Energy dip likely by evening" : "Energy should stay relatively steady"}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {dailyLog.sleepHours < 6
                ? "Low sleep plus lower-quality or sugary choices raises the chance of another hunger spike tonight."
                : "Protein and fiber coverage look strong enough to keep the day steadier."}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Late-night risk: {lateNightRisk}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Low sleep and hidden-calorie snacks usually raise evening hunger.
            </p>
            <p className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              Prioritize a protein + fiber dinner and avoid drinking calories late.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Meal gap warning</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Long unplanned gaps increase the chance of a fast sugar hit later.
            </p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Coaching and swaps</h2>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Protein gap coach</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {proteinRemaining > 0
                ? `You still need about ${Math.round(proteinRemaining)}g protein. A chicken wrap, tofu bowl, eggs, or Greek yogurt would close it efficiently.`
                : "Protein target is effectively covered today."}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Fiber recovery mode</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {fiberRemaining > 0
                ? `You are about ${Math.round(fiberRemaining)}g short on fiber. Add lentils, fruit, oats, beans, or a veggie-heavy side tonight.`
                : "Fiber coverage is in a good range already."}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Smart meal swap</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Swap <span className="font-medium">{smartSwap.current}</span> for <span className="font-medium">{smartSwap.better}</span>.
            </p>
            <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">{smartSwap.impact}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Habit story recap</h2>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            {hiddenAlerts.length
              ? "Your weekday structure looks solid, but drinks and low-satiety choices are still the biggest source of hidden calories."
              : "Protein, meal timing, and hydration are trending in a healthier direction."}
          </p>
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Budget rollover</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {budgetDelta >= 0
                ? `You are under today's target by ${Math.round(budgetDelta)} calories, which gives you room if tomorrow runs higher.`
                : `You are over today's target by ${Math.round(Math.abs(budgetDelta))} calories, so a lighter next meal would smooth the daily average.`}
            </p>
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Snack rescue and streaks</h2>
          {[
            "Greek yogurt with berries for protein + sweetness",
            "Apple with peanut butter for fiber + satiety",
            "Roasted chickpeas when you want something crunchy",
          ].map((suggestion) => (
            <div key={suggestion} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              {suggestion}
            </div>
          ))}
          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">Gentle streaks</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Logged {combinedMeals.length} meals or draft entries today</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {totals.protein >= profile.macroTargets.protein ? "Hit protein goal today" : "Protein goal still in progress"}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {dailyLog.waterIntake >= profile.waterTarget * 0.7 ? "Tracked water well today" : "Water intake still needs a push"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
