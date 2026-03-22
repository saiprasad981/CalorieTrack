import { Schema, model, models } from "mongoose";

const FoodSchema = new Schema(
  {
    name: { type: String, index: true },
    brand: String,
    servingSize: Number,
    unit: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    source: String,
    sourceId: String,
    verified: Boolean,
  },
  { timestamps: true },
);

export const FoodModel = models.Food || model("Food", FoodSchema);
