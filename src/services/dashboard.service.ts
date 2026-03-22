import { buildWhatToEatNext, calculateCaloriesRemaining, getCalorieTargetForDate } from "@/lib/calculations";
import { dailyLog, demoUser, insights, mealLogs } from "@/lib/mock-data";
import { getFeatureEngine } from "@/services/insight.service";

function getMealHealthEffect(meal: (typeof mealLogs)[number]) {
  if ((meal.totalProtein >= 25 && meal.totalFiber >= 8) || (meal.satietyScore ?? 0) >= 75) {
    return {
      label: "High satiety",
      impact: "Supports fullness, steadier energy, and easier weight control.",
    };
  }

  if ((meal.items[0]?.food.sugar ?? 0) > 18) {
    return {
      label: "Fast energy, low staying power",
      impact: "May feel energizing briefly but could trigger another craving later.",
    };
  }

  if (meal.totalCalories > 500 && meal.totalFat > 18) {
    return {
      label: "Heavy meal",
      impact: "Likely filling, but can feel sluggish if your day is inactive.",
    };
  }

  return {
    label: "Balanced support",
    impact: "Reasonably supports energy and fits a sustainable fat-loss routine.",
  };
}

export async function getTodayDashboard() {
  const totals = mealLogs.reduce(
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

  const target = getCalorieTargetForDate(demoUser.flexibleBudget, demoUser.dailyCalories, new Date("2026-03-22"));

  const features = await getFeatureEngine();
  const mealPeriodSummary = ["breakfast", "lunch", "snack", "dinner"].map((period) => {
    const meal = mealLogs.find((entry) => entry.mealType === period);

    if (!meal) {
      return {
        period,
        tracked: false,
        title: `No ${period} logged yet`,
        summary: "Track this meal to improve timing, energy, and craving analysis.",
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

  return {
    user: demoUser,
    dailyLog,
    meals: mealLogs,
    totals,
    target,
    remaining: calculateCaloriesRemaining(totals.calories, target),
    whatToEatNext: buildWhatToEatNext(demoUser, totals),
    insights,
    features,
    mealPeriodSummary,
  };
}
