import type { FoodItem, MacroSplit } from "@/types/food";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type MoodType = "energized" | "calm" | "stressed" | "tired" | "craving";

export type MealLogItem = {
  food: FoodItem;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type MealLog = MacroSplit & {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  items: MealLogItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  hungerBefore?: number;
  fullnessAfter?: number;
  mood?: MoodType;
  stressLevel?: number;
  notes?: string;
  qualityScore?: number;
  satietyScore?: number;
};

export type SavedMeal = {
  id: string;
  userId: string;
  name: string;
  items: MealLogItem[];
  tags: string[];
  favorite?: boolean;
  createdAt: string;
};
