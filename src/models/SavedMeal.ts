import { Schema, model, models } from "mongoose";

const SavedMealSchema = new Schema(
  {
    userId: { type: String, index: true },
    name: String,
    items: [Schema.Types.Mixed],
    tags: [String],
    favorite: Boolean,
  },
  { timestamps: true },
);

export const SavedMealModel = models.SavedMeal || model("SavedMeal", SavedMealSchema);
