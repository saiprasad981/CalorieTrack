import { Schema, model, models } from "mongoose";

const DailyLogSchema = new Schema(
  {
    userId: { type: String, index: true },
    date: { type: String, index: true },
    waterIntake: Number,
    sleepHours: Number,
    cravings: [String],
    steps: Number,
    stressLevel: Number,
    notes: String,
  },
  { timestamps: true },
);

DailyLogSchema.index({ userId: 1, date: -1 });

export const DailyLogModel = models.DailyLog || model("DailyLog", DailyLogSchema);
