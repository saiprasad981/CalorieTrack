import { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema(
  {
    theme: String,
    notifications: {
      water: Boolean,
      mealReminder: Boolean,
      weeklyReport: Boolean,
    },
    units: String,
    privacy: String,
    connectedApis: {
      googleFit: Boolean,
      appleHealth: Boolean,
      usda: Boolean,
    },
    dataExport: String,
  },
  { _id: false },
);

const MealDraftItemSchema = new Schema(
  {
    food: Schema.Types.Mixed,
    quantity: Number,
  },
  { _id: false },
);

const MealDraftSchema = new Schema(
  {
    mealType: String,
    hungerBefore: Number,
    fullnessAfter: Number,
    mood: String,
    stressLevel: Number,
    notes: String,
    selectedFoodId: String,
    quantity: Number,
    draftItems: [MealDraftItemSchema],
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    image: String,
    googleId: String,
    passwordHash: String,
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    goal: String,
    activityLevel: String,
    dailyCalories: Number,
    macroTargets: {
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
    },
    flexibleBudget: {
      mode: String,
      weekdayCalories: Number,
      weekendCalories: Number,
      gymDayBoost: Number,
      weeklyCalories: Number,
    },
    waterTarget: Number,
    settings: SettingsSchema,
    currentMealDraft: MealDraftSchema,
  },
  { timestamps: true },
);

export const UserModel = models.User || model("User", UserSchema);
