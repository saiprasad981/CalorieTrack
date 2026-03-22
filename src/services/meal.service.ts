import { calculateMealQuality, calculateMealTotals, calculateSatietyScore } from "@/lib/calculations";
import { foodLibrary, mealLogs, savedMeals } from "@/lib/mock-data";
import { connectToDatabase } from "@/lib/mongoose";
import { mealSchema, savedMealSchema } from "@/lib/validators";
import { MealLogModel } from "@/models/MealLog";
import { SavedMealModel } from "@/models/SavedMeal";
import type { MealLog } from "@/types/meal";

type PersistedMeal = Partial<MealLog> & {
  _id: unknown;
  userId: string;
  date: Date | string;
};

function serializeMeal(meal: PersistedMeal) {
  return {
    id: String(meal._id),
    userId: meal.userId,
    date: new Date(meal.date).toISOString(),
    mealType: meal.mealType,
    items: meal.items ?? [],
    totalCalories: meal.totalCalories ?? 0,
    totalProtein: meal.totalProtein ?? 0,
    totalCarbs: meal.totalCarbs ?? 0,
    totalFat: meal.totalFat ?? 0,
    totalFiber: meal.totalFiber ?? 0,
    protein: meal.protein ?? meal.totalProtein ?? 0,
    carbs: meal.carbs ?? meal.totalCarbs ?? 0,
    fat: meal.fat ?? meal.totalFat ?? 0,
    fiber: meal.fiber ?? meal.totalFiber ?? 0,
    hungerBefore: meal.hungerBefore,
    fullnessAfter: meal.fullnessAfter,
    mood: meal.mood,
    stressLevel: meal.stressLevel,
    notes: meal.notes,
    qualityScore: meal.qualityScore,
    satietyScore: meal.satietyScore,
  };
}

export async function listMeals(userId?: string) {
  if (!userId) {
    return mealLogs;
  }

  await connectToDatabase();
  const meals = await MealLogModel.find({ userId }).sort({ date: -1, createdAt: -1 }).lean();
  return meals.map(serializeMeal);
}

export async function createMeal(input: unknown, userId?: string) {
  const parsed = mealSchema.parse(input);
  const items = parsed.items.map((item) => {
    const food = foodLibrary.find((entry) => entry.id === item.foodId) ?? foodLibrary[0];
    const factor = item.quantity / food.servingSize;

    return {
      food,
      quantity: item.quantity,
      unit: food.unit,
      calories: Number((food.calories * factor).toFixed(1)),
      protein: Number((food.protein * factor).toFixed(1)),
      carbs: Number((food.carbs * factor).toFixed(1)),
      fat: Number((food.fat * factor).toFixed(1)),
      fiber: Number((food.fiber * factor).toFixed(1)),
    };
  });

  const totals = calculateMealTotals(items);
  const mealPayload = {
    userId: userId ?? "demo-user",
    date: new Date(parsed.date),
    mealType: parsed.mealType,
    items,
    ...totals,
    protein: totals.totalProtein,
    carbs: totals.totalCarbs,
    fat: totals.totalFat,
    fiber: totals.totalFiber,
    hungerBefore: parsed.hungerBefore,
    fullnessAfter: parsed.fullnessAfter,
    mood: parsed.mood,
    stressLevel: parsed.stressLevel,
    notes: parsed.notes,
    qualityScore: calculateMealQuality({ items, ...totals }),
    satietyScore: calculateSatietyScore({
      hungerBefore: parsed.hungerBefore,
      fullnessAfter: parsed.fullnessAfter,
      totalCalories: totals.totalCalories,
      totalProtein: totals.totalProtein,
      totalFiber: totals.totalFiber,
    }),
  };

  if (!userId) {
    return {
      id: `meal-${Date.now()}`,
      ...mealPayload,
      date: parsed.date,
    };
  }

  await connectToDatabase();
  const meal = await MealLogModel.create(mealPayload);
  return serializeMeal(meal.toObject());
}

export async function listSavedMeals(userId?: string) {
  if (!userId) {
    return savedMeals;
  }

  await connectToDatabase();
  const meals = await SavedMealModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return meals.map((meal) => ({
    id: String(meal._id),
    userId: meal.userId,
    name: meal.name,
    items: meal.items ?? [],
    tags: meal.tags ?? [],
    favorite: meal.favorite ?? false,
    createdAt: meal.createdAt instanceof Date ? meal.createdAt.toISOString() : new Date().toISOString(),
  }));
}

export async function createSavedMeal(input: unknown, userId?: string) {
  const parsed = savedMealSchema.parse(input);
  const payload = {
    userId: userId ?? "demo-user",
    name: parsed.name,
    items: parsed.items.map((item) => {
      const food = foodLibrary.find((entry) => entry.id === item.foodId) ?? foodLibrary[0];
      return {
        food,
        quantity: item.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
      };
    }),
    tags: parsed.tags,
    favorite: false,
  };

  if (!userId) {
    return {
      id: `saved-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
  }

  await connectToDatabase();
  const savedMeal = await SavedMealModel.create(payload);
  return {
    id: String(savedMeal._id),
    ...payload,
    createdAt: savedMeal.createdAt.toISOString(),
  };
}
