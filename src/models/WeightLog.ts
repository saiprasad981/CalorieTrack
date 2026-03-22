import { Schema, model, models } from "mongoose";

const WeightLogSchema = new Schema(
  {
    userId: { type: String, index: true },
    date: { type: String, index: true },
    weight: Number,
  },
  { timestamps: true },
);

WeightLogSchema.index({ userId: 1, date: -1 });

export const WeightLogModel = models.WeightLog || model("WeightLog", WeightLogSchema);
