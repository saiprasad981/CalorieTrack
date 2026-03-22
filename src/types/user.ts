import type { MacroSplit } from "@/types/food";

export type FlexibleBudgetMode = "standard" | "weekend" | "gym-day" | "weekly";

export type FlexibleBudget = {
  mode: FlexibleBudgetMode;
  weekdayCalories?: number;
  weekendCalories?: number;
  gymDayBoost?: number;
  weeklyCalories?: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: "lose" | "maintain" | "gain";
  activityLevel?: "low" | "moderate" | "high";
  dailyCalories: number;
  macroTargets: MacroSplit;
  flexibleBudget: FlexibleBudget;
  waterTarget: number;
};

export type DailyLog = {
  id: string;
  userId: string;
  date: string;
  waterIntake: number;
  sleepHours: number;
  cravings: string[];
  steps: number;
  notes?: string;
  stressLevel: number;
};

export type WeightLog = {
  id: string;
  userId: string;
  date: string;
  weight: number;
};
