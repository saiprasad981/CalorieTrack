import { Schema, model, models } from "mongoose";

const InsightSchema = new Schema(
  {
    userId: { type: String, index: true },
    date: { type: String, index: true },
    type: String,
    title: String,
    message: String,
    priority: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

InsightSchema.index({ userId: 1, date: -1 });

export const InsightModel = models.Insight || model("Insight", InsightSchema);
