import { connectToDatabase } from "@/lib/mongoose";
import { dailyLog as demoDailyLog, demoUser, weightLogs as demoWeightLogs } from "@/lib/mock-data";
import { DailyLogModel } from "@/models/DailyLog";
import { UserModel } from "@/models/User";
import { WeightLogModel } from "@/models/WeightLog";
import type { AppSettings } from "@/types/settings";
import type { UserProfile } from "@/types/user";

export const defaultSettings: AppSettings = {
  theme: "system",
  notifications: {
    water: true,
    mealReminder: true,
    weeklyReport: true,
  },
  units: "metric",
  privacy: "private",
  connectedApis: {
    googleFit: false,
    appleHealth: false,
    usda: true,
  },
  dataExport: "json",
};

type PersistedUser = {
  _id: unknown;
  name?: string;
  email?: string;
  image?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: UserProfile["goal"];
  activityLevel?: UserProfile["activityLevel"];
  dailyCalories?: number;
  macroTargets?: UserProfile["macroTargets"];
  flexibleBudget?: UserProfile["flexibleBudget"];
  waterTarget?: number;
};

function toProfile(user: PersistedUser): UserProfile {
  return {
    ...demoUser,
    id: String(user._id),
    name: user.name ?? demoUser.name,
    email: user.email ?? demoUser.email,
    image: user.image ?? "",
    age: user.age ?? demoUser.age,
    gender: user.gender ?? demoUser.gender,
    height: user.height ?? demoUser.height,
    weight: user.weight ?? demoUser.weight,
    goal: user.goal ?? demoUser.goal,
    activityLevel: user.activityLevel ?? demoUser.activityLevel,
    dailyCalories: user.dailyCalories ?? demoUser.dailyCalories,
    macroTargets: user.macroTargets ?? demoUser.macroTargets,
    flexibleBudget: user.flexibleBudget ?? demoUser.flexibleBudget,
    waterTarget: user.waterTarget ?? demoUser.waterTarget,
  };
}

export async function getProfile(userId: string) {
  await connectToDatabase();
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }
  return toProfile(user);
}

export async function updateProfile(userId: string, input: UserProfile) {
  await connectToDatabase();

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    {
      name: input.name,
      email: input.email.toLowerCase(),
      image: input.image,
      age: input.age,
      gender: input.gender,
      height: input.height,
      weight: input.weight,
      goal: input.goal,
      activityLevel: input.activityLevel,
      dailyCalories: input.dailyCalories,
      macroTargets: input.macroTargets,
      flexibleBudget: input.flexibleBudget,
      waterTarget: input.waterTarget,
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new Error("User not found");
  }

  return toProfile(updated);
}

export async function getSettings(userId: string) {
  await connectToDatabase();
  const user = await UserModel.findById(userId).select("settings").lean();
  return user?.settings ?? defaultSettings;
}

export async function updateSettings(userId: string, settings: AppSettings) {
  await connectToDatabase();
  await UserModel.findByIdAndUpdate(userId, { settings }, { new: true });
  return settings;
}

export async function getCurrentMealDraft(userId: string) {
  await connectToDatabase();
  const user = await UserModel.findById(userId).select("currentMealDraft").lean();
  return user?.currentMealDraft ?? null;
}

export async function updateCurrentMealDraft(userId: string, currentMealDraft: unknown) {
  await connectToDatabase();
  await UserModel.findByIdAndUpdate(userId, { currentMealDraft }, { new: true });
  return currentMealDraft;
}

export async function clearCurrentMealDraft(userId: string) {
  await connectToDatabase();
  await UserModel.findByIdAndUpdate(userId, { currentMealDraft: null }, { new: true });
}

export async function getDailyLog(userId: string, date: string) {
  await connectToDatabase();
  const log = await DailyLogModel.findOne({ userId, date }).lean();
  if (!log) {
    return {
      ...demoDailyLog,
      userId,
      date,
    };
  }

  return {
    id: String(log._id),
    userId: log.userId,
    date: log.date,
    waterIntake: log.waterIntake ?? demoDailyLog.waterIntake,
    sleepHours: log.sleepHours ?? demoDailyLog.sleepHours,
    cravings: log.cravings ?? [],
    steps: log.steps ?? 0,
    notes: log.notes ?? "",
    stressLevel: log.stressLevel ?? demoDailyLog.stressLevel,
  };
}

export async function upsertDailyLog(
  userId: string,
  date: string,
  input: {
    waterIntake: number;
    sleepHours: number;
    cravings: string[];
    steps: number;
    stressLevel: number;
    notes?: string;
  },
) {
  await connectToDatabase();
  const log = await DailyLogModel.findOneAndUpdate(
    { userId, date },
    { userId, date, ...input },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    id: String(log?._id),
    userId,
    date,
    waterIntake: log?.waterIntake ?? input.waterIntake,
    sleepHours: log?.sleepHours ?? input.sleepHours,
    cravings: log?.cravings ?? input.cravings,
    steps: log?.steps ?? input.steps,
    notes: log?.notes ?? input.notes ?? "",
    stressLevel: log?.stressLevel ?? input.stressLevel,
  };
}

export async function getWeightProgress(userId: string) {
  await connectToDatabase();

  const [user, entries, log] = await Promise.all([
    UserModel.findById(userId).select("weight").lean(),
    WeightLogModel.find({ userId }).sort({ date: 1 }).lean(),
    getDailyLog(userId, new Date().toISOString().slice(0, 10)),
  ]);

  if (!entries.length) {
    return {
      current: user?.weight ?? demoUser.weight,
      start: user?.weight ?? demoUser.weight,
      entries: demoWeightLogs,
      dailyLog: log,
    };
  }

  return {
    current: user?.weight ?? entries[entries.length - 1]?.weight ?? demoUser.weight,
    start: entries[0]?.weight ?? demoUser.weight,
    entries: entries.map((entry) => ({
      id: String(entry._id),
      userId: entry.userId,
      date: entry.date,
      weight: entry.weight,
    })),
    dailyLog: log,
  };
}
