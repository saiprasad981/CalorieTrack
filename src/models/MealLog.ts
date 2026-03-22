import { Schema, model, models } from "mongoose";

const MealItemSchema = new Schema(
  {
    foodId: String,
    name: String,
    quantity: Number,
    unit: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
  },
  { _id: false },
);

const MealLogSchema = new Schema(
  {
    userId: { type: String, index: true },
    date: { type: Date, index: true },
    mealType: String,
    items: [MealItemSchema],
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFat: Number,
    totalFiber: Number,
    hungerBefore: Number,
    fullnessAfter: Number,
    mood: String,
    stressLevel: Number,
    notes: String,
  },
  { timestamps: true },
);

MealLogSchema.index({ userId: 1, date: -1 });

export const MealLogModel = models.MealLog || model("MealLog", MealLogSchema);
