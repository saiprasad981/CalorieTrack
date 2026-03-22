export type InsightType =
  | "sleep"
  | "protein"
  | "satiety"
  | "sugar"
  | "budget"
  | "meal-quality"
  | "cravings";

export type Insight = {
  id: string;
  userId: string;
  date: string;
  type: InsightType;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  metadata?: Record<string, string | number | boolean>;
};
