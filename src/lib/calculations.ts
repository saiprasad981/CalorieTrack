import { clamp } from "@/lib/utils";
import type { FoodItem } from "@/types/food";
import type { MealLog, MealLogItem } from "@/types/meal";
import type { FlexibleBudget, UserProfile } from "@/types/user";

export function scaleFood(food: FoodItem, quantity: number): MealLogItem {
  const factor = quantity / food.servingSize;

  return {
    food,
    quantity,
    unit: food.unit,
    calories: Number((food.calories * factor).toFixed(1)),
    protein: Number((food.protein * factor).toFixed(1)),
    carbs: Number((food.carbs * factor).toFixed(1)),
    fat: Number((food.fat * factor).toFixed(1)),
    fiber: Number((food.fiber * factor).toFixed(1)),
  };
}

export function calculateMealTotals(items: MealLogItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.totalCalories += item.calories;
      acc.totalProtein += item.protein;
      acc.totalCarbs += item.carbs;
      acc.totalFat += item.fat;
      acc.totalFiber += item.fiber;
      return acc;
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
    },
  );
}

export function calculateMealQuality(log: Pick<MealLog, "items" | "totalProtein" | "totalFiber" | "totalCalories">) {
  const veggieHits = log.items.filter((item) =>
    /(vegetable|spinach|broccoli|lentil|bean|fruit|salad|oats)/i.test(item.food.name),
  ).length;
  const processedHits = log.items.filter((item) =>
    /(cookie|soda|sauce|fried|cake|dessert|latte)/i.test(item.food.name),
  ).length;
  const proteinDensity = log.totalProtein / Math.max(log.totalCalories, 1);
  const fiberDensity = log.totalFiber / Math.max(log.totalCalories, 1);

  return clamp(
    Math.round(proteinDensity * 900 + fiberDensity * 1400 + veggieHits * 10 - processedHits * 8 + 40),
    0,
    100,
  );
}

export function calculateSatietyScore(log: Pick<MealLog, "hungerBefore" | "fullnessAfter" | "totalCalories" | "totalProtein" | "totalFiber">) {
  const hungerLift = (log.fullnessAfter ?? 5) - (log.hungerBefore ?? 5) + 5;
  const fullnessPerCalorie = hungerLift / Math.max(log.totalCalories, 1);
  const proteinBoost = log.totalProtein / 10;
  const fiberBoost = log.totalFiber * 2;

  return clamp(Math.round(fullnessPerCalorie * 1200 + proteinBoost + fiberBoost + 25), 0, 100);
}

export function calculateCaloriesRemaining(consumed: number, target: number) {
  return target - consumed;
}

export function getCalorieTargetForDate(budget: FlexibleBudget, baseCalories: number, date = new Date()) {
  if (budget.mode === "weekend") {
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    return weekend ? budget.weekendCalories ?? baseCalories + 250 : budget.weekdayCalories ?? baseCalories;
  }

  if (budget.mode === "gym-day") {
    return baseCalories + (budget.gymDayBoost ?? 250);
  }

  if (budget.mode === "weekly") {
    return Math.round((budget.weeklyCalories ?? baseCalories * 7) / 7);
  }

  return baseCalories;
}

export function buildWhatToEatNext(profile: UserProfile, consumed: { protein: number; fiber: number; calories: number }) {
  if (consumed.protein < profile.macroTargets.protein * 0.6) {
    return "Protein is trailing today. Try a Greek yogurt bowl, eggs on toast, tofu rice bowl, or chicken wrap next.";
  }

  if (consumed.fiber < profile.macroTargets.fiber * 0.55) {
    return "Fiber is lagging. A fruit and oats snack, lentil soup, chickpea salad, or veggie sandwich would balance the day.";
  }

  if (consumed.calories > profile.dailyCalories * 0.85) {
    return "You are close to your budget. Go for a lighter, high-satiety option like yogurt with berries or a broth-based meal.";
  }

  return "You are on track. A balanced next meal with lean protein, vegetables, and slow carbs will keep momentum steady.";
}
