import { z } from "zod";

export const profileSchema = z.object({
  age: z.coerce.number().min(13).max(100),
  gender: z.string().min(1),
  height: z.coerce.number().min(100).max(240),
  weight: z.coerce.number().min(30).max(300),
  goal: z.enum(["lose", "maintain", "gain"]),
  activityLevel: z.enum(["low", "moderate", "high"]),
  dailyCalories: z.coerce.number().min(1200).max(5000),
  protein: z.coerce.number().min(40).max(300),
  carbs: z.coerce.number().min(50).max(500),
  fat: z.coerce.number().min(20).max(200),
});

export const foodSearchSchema = z.object({
  query: z.string().min(2),
});

export const customFoodSchema = z.object({
  name: z.string().min(2),
  brand: z.string().optional(),
  servingSize: z.coerce.number().positive(),
  unit: z.string().min(1),
  calories: z.coerce.number().nonnegative(),
  protein: z.coerce.number().nonnegative(),
  carbs: z.coerce.number().nonnegative(),
  fat: z.coerce.number().nonnegative(),
  fiber: z.coerce.number().nonnegative(),
  sugar: z.coerce.number().nonnegative().optional(),
});

export const mealItemSchema = z.object({
  foodId: z.string(),
  quantity: z.coerce.number().positive(),
});

export const mealSchema = z.object({
  date: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  items: z.array(mealItemSchema).min(1),
  hungerBefore: z.coerce.number().min(1).max(10).optional(),
  fullnessAfter: z.coerce.number().min(1).max(10).optional(),
  mood: z.enum(["energized", "calm", "stressed", "tired", "craving"]).optional(),
  stressLevel: z.coerce.number().min(1).max(10).optional(),
  notes: z.string().max(240).optional(),
});

export const savedMealSchema = z.object({
  name: z.string().min(2),
  tags: z.array(z.string()).default([]),
  items: z.array(mealItemSchema).min(1),
});
