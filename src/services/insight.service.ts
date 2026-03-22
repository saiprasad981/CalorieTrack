import { dailyLog, demoUser, insights, mealLogs, savedMeals } from "@/lib/mock-data";

function getSatietyRanking() {
  return mealLogs
    .map((meal) => ({
      id: meal.id,
      mealType: meal.mealType,
      name: meal.items.map((item) => item.food.name).join(", "),
      score: meal.satietyScore ?? 0,
      quality: meal.qualityScore ?? 0,
      calories: meal.totalCalories,
      fullnessPer100Calories: Number((((meal.fullnessAfter ?? 5) / Math.max(meal.totalCalories, 1)) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.score - a.score);
}

function getHiddenCalorieAlerts() {
  return mealLogs
    .flatMap((meal) =>
      meal.items
        .filter((item) => /(latte|sauce|oil|fried|sweet|sugary|drink|coffee)/i.test(item.food.name))
        .map((item) => ({
          mealId: meal.id,
          mealType: meal.mealType,
          name: item.food.name,
          reason:
            item.food.sugar && item.food.sugar > 15
              ? "High liquid sugar density"
              : "Often undercounted add-on calories",
          calories: item.calories,
        })),
    )
    .slice(0, 4);
}

function getCravingTriggerMap() {
  return [
    {
      trigger: "Low sleep + stress",
      evidence: `${dailyLog.sleepHours}h sleep and stress ${dailyLog.stressLevel}/10 coincided with the latte snack.`,
      action: "Add a planned protein snack around 4 PM on low-sleep workdays.",
    },
    {
      trigger: "Long lunch gap",
      evidence: "There was a long gap after lunch before your snack craving hit.",
      action: "Use a bridge snack or earlier lunch on meeting-heavy days.",
    },
  ];
}

function getEnergyForecast() {
  const proteinScore = mealLogs.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const fiberScore = mealLogs.reduce((sum, meal) => sum + meal.totalFiber, 0);
  const status = dailyLog.sleepHours < 6 || fiberScore < 18 ? "watch" : "steady";

  return {
    status,
    title: status === "watch" ? "Energy dip likely by evening" : "Energy should stay relatively steady",
    message:
      status === "watch"
        ? "Low sleep plus a sugary snack raises the chance of another hunger spike tonight."
        : "Protein and fiber coverage look strong enough to keep the day stable.",
    proteinScore,
    fiberScore,
  };
}

function getSnackRescueSuggestions() {
  return [
    "Greek yogurt with berries for protein + sweetness",
    "Apple with peanut butter for fiber + satiety",
    "Roasted chickpeas when you want something crunchy",
  ];
}

function getMealGapWarnings() {
  return [
    {
      gap: "Lunch to snack",
      warning: "Long unplanned gaps increase the chance of a fast sugar hit later.",
    },
  ];
}

function getLateNightRisk() {
  const risk = dailyLog.sleepHours < 6 ? "medium" : "low";
  return {
    risk,
    reason: "Low sleep and afternoon cravings usually raise evening hunger.",
    action: "Prioritize a protein + fiber dinner and avoid drinking calories after 8 PM.",
  };
}

function getProteinGapCoach() {
  const consumed = mealLogs.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const remaining = Math.max(demoUser.macroTargets.protein - consumed, 0);
  return {
    consumed,
    remaining,
    suggestion:
      remaining > 0
        ? `You still need about ${Math.round(remaining)}g protein. A chicken wrap, tofu bowl, eggs, or Greek yogurt would close it efficiently.`
        : "Protein target is effectively covered today.",
  };
}

function getFiberRecoveryMode() {
  const consumed = mealLogs.reduce((sum, meal) => sum + meal.totalFiber, 0);
  const remaining = Math.max(demoUser.macroTargets.fiber - consumed, 0);
  return {
    consumed,
    remaining,
    suggestion:
      remaining > 0
        ? `You are about ${Math.round(remaining)}g short on fiber. Add lentils, fruit, oats, beans, or a veggie-heavy side tonight.`
        : "Fiber coverage is in a good range already.",
  };
}

function getHabitStoryRecap() {
  return "Weekday structure looks strong, but coffee-based snacks are still the biggest source of hidden calories and low-satiety decisions.";
}

function getConsistencyScore() {
  return {
    score: 81,
    label: "Consistent, not perfect",
    message: "Protein, water, and meal timing are trending in the right direction even when calories fluctuate.",
  };
}

function getSmartMealSwap() {
  return {
    current: "Iced Vanilla Latte",
    better: "Cold brew with milk + protein yogurt",
    impact: "Roughly 90 fewer calories with stronger satiety and more protein.",
  };
}

function getBudgetRollover() {
  const spent = mealLogs.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const target = demoUser.flexibleBudget.weekdayCalories ?? demoUser.dailyCalories;
  return {
    target,
    spent,
    status: spent < target ? "under" : "over",
    message:
      spent < target
        ? `You are under today's weekday target by ${Math.round(target - spent)} calories, which gives you room if tomorrow runs higher.`
        : `You are over today's target by ${Math.round(spent - target)} calories, so a lighter breakfast tomorrow would smooth the weekly average.`,
  };
}

function getSmartRepeats() {
  return [
    {
      label: "Repeat yesterday's breakfast",
      meal: mealLogs[0]?.items[0]?.food.name ?? "Greek Yogurt Bowl",
    },
    {
      label: "Usual Monday lunch",
      meal: savedMeals[1]?.name ?? "Office canteen lunch",
    },
    {
      label: "Post-work protein option",
      meal: savedMeals[0]?.name ?? "Mom's chicken curry",
    },
  ];
}

export async function getFeatureEngine() {
  return {
    satietyRanking: getSatietyRanking(),
    hiddenCalorieAlerts: getHiddenCalorieAlerts(),
    cravingTriggerMap: getCravingTriggerMap(),
    energyForecast: getEnergyForecast(),
    snackRescueSuggestions: getSnackRescueSuggestions(),
    mealGapWarnings: getMealGapWarnings(),
    lateNightRisk: getLateNightRisk(),
    proteinGapCoach: getProteinGapCoach(),
    fiberRecoveryMode: getFiberRecoveryMode(),
    habitStoryRecap: getHabitStoryRecap(),
    consistencyScore: getConsistencyScore(),
    smartMealSwap: getSmartMealSwap(),
    budgetRollover: getBudgetRollover(),
    smartRepeats: getSmartRepeats(),
  };
}

export async function getDailyInsights() {
  return insights;
}

export async function getWeeklyInsights() {
  const features = await getFeatureEngine();

  return {
    streaks: [
      "Logged 3 meals for 5 of the last 7 days",
      "Hit protein goal on 4 of the last 7 days",
      "Tracked water on 6 of the last 7 days",
    ],
    satietyLeaderboard: mealLogs
      .map((meal) => ({
        id: meal.id,
        mealType: meal.mealType,
        score: meal.satietyScore ?? 0,
        calories: meal.totalCalories,
      }))
      .sort((a, b) => b.score - a.score),
    insights,
    features,
  };
}
