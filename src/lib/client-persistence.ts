import { dailyLog, demoUser, mealLogs } from "@/lib/mock-data";
import type { FoodItem } from "@/types/food";
import type { MealLog } from "@/types/meal";
import type { AppSettings } from "@/types/settings";
import type { DailyLog, UserProfile } from "@/types/user";

const PROFILE_KEY = "calorietrack.profile";
const SETTINGS_KEY = "calorietrack.settings";
const ACCOUNTS_KEY = "calorietrack.accounts";
const SESSION_KEY = "calorietrack.session";
const MEAL_LOGS_KEY = "calorietrack.meal-logs";
const DAILY_LOG_KEY = "calorietrack.daily-log";
const MEAL_DRAFT_KEY = "calorietrack.meal-draft";
const AUTH_COOKIE_NAME = "calorietrack-auth";

function postJson(path: string, payload?: unknown, method = "POST") {
  if (typeof window === "undefined") {
    return;
  }

  void fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  }).catch(() => undefined);
}

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

type SignupSeed = {
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
};

export type LocalAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  profileId: string;
};

export type LocalSession = {
  accountId: string;
  email: string;
  name: string;
};

export type StoredMealDraft = {
  mealType: "breakfast" | "lunch" | "snack" | "dinner";
  hungerBefore: number;
  fullnessAfter: number;
  mood: "energized" | "calm" | "stressed" | "tired" | "craving";
  stressLevel: number;
  notes: string;
  selectedFoodId: string;
  quantity: number;
  draftItems: Array<{
    food: FoodItem;
    quantity: number;
  }>;
};

function sanitizeScope(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase();
}

function getScopedStorageKey(baseKey: string) {
  if (typeof window === "undefined") {
    return baseKey;
  }

  const rawSession = window.localStorage.getItem(SESSION_KEY);
  if (!rawSession) {
    return baseKey;
  }

  try {
    const session = JSON.parse(rawSession) as LocalSession;
    const scope = sanitizeScope(session.accountId || session.email);
    return `${baseKey}:${scope}`;
  } catch {
    return baseKey;
  }
}

function readStorageValue<T>(baseKey: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const scopedKey = getScopedStorageKey(baseKey);
  const scopedRaw = window.localStorage.getItem(scopedKey);
  if (scopedRaw) {
    try {
      return JSON.parse(scopedRaw) as T;
    } catch {
      return fallback;
    }
  }

  const legacyRaw = window.localStorage.getItem(baseKey);
  if (legacyRaw) {
    try {
      return JSON.parse(legacyRaw) as T;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function writeStorageValue(baseKey: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  const scopedKey = getScopedStorageKey(baseKey);
  window.localStorage.setItem(scopedKey, JSON.stringify(value));
}

export function buildProfileFromSignup(seed: SignupSeed): UserProfile {
  const bmr =
    10 * seed.weight +
    6.25 * seed.height -
    5 * seed.age +
    (/male/i.test(seed.gender) ? 5 : -161);
  const dailyCalories = Math.max(1400, Math.round(bmr * 1.45 - 250));
  const protein = Math.round(seed.weight * 1.8);
  const fat = Math.round(seed.weight * 0.85);
  const carbs = Math.max(120, Math.round((dailyCalories - protein * 4 - fat * 9) / 4));

  return {
    ...demoUser,
    id: `local-${Date.now()}`,
    name: seed.name,
    email: seed.email,
    age: seed.age,
    gender: seed.gender,
    height: seed.height,
    weight: seed.weight,
    goal: "lose",
    activityLevel: "moderate",
    dailyCalories,
    macroTargets: {
      protein,
      carbs,
      fat,
      fiber: 30,
    },
    flexibleBudget: {
      mode: "weekend",
      weekdayCalories: dailyCalories,
      weekendCalories: dailyCalories + 250,
    },
    waterTarget: 2600,
  };
}

export function getStoredProfile() {
  return readStorageValue(PROFILE_KEY, demoUser);
}

export function saveStoredProfile(profile: UserProfile) {
  writeStorageValue(PROFILE_KEY, profile);
  if (typeof window === "undefined") {
    return;
  }
  postJson("/api/profile", {
    age: profile.age,
    gender: profile.gender,
    height: profile.height,
    weight: profile.weight,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
    dailyCalories: profile.dailyCalories,
    protein: profile.macroTargets.protein,
    carbs: profile.macroTargets.carbs,
    fat: profile.macroTargets.fat,
  }, "PATCH");
  window.dispatchEvent(new CustomEvent("calorietrack:profile-updated"));
}

export function getStoredAccounts() {
  if (typeof window === "undefined") {
    return [] as LocalAccount[];
  }

  const raw = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    return [] as LocalAccount[];
  }

  try {
    return JSON.parse(raw) as LocalAccount[];
  } catch {
    return [] as LocalAccount[];
  }
}

export function saveStoredAccounts(accounts: LocalAccount[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function registerLocalAccount(input: {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}) {
  const accounts = getStoredAccounts();
  const exists = accounts.some((account) => account.email.toLowerCase() === input.email.toLowerCase());

  if (exists) {
    return { ok: false as const, message: "An account with this email already exists." };
  }

  const account: LocalAccount = {
    id: `account-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    profileId: input.profile.id,
  };

  saveStoredAccounts([...accounts, account]);
  saveStoredSession({
    accountId: account.id,
    email: account.email,
    name: account.name,
  });
  saveStoredProfile(input.profile);

  return { ok: true as const, account };
}

export function authenticateLocalAccount(email: string, password: string) {
  const accounts = getStoredAccounts();
  const account = accounts.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!account || account.password !== password) {
    return { ok: false as const, message: "Invalid email or password." };
  }

  saveStoredSession({
    accountId: account.id,
    email: account.email,
    name: account.name,
  });

  return { ok: true as const, account };
}

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null as LocalSession | null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null as LocalSession | null;
  }

  try {
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null as LocalSession | null;
  }
}

export function saveStoredSession(session: LocalSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  window.dispatchEvent(new CustomEvent("calorietrack:session-updated"));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  window.dispatchEvent(new CustomEvent("calorietrack:session-updated"));
}

export function getStoredMealLogs() {
  return readStorageValue(MEAL_LOGS_KEY, mealLogs);
}

export function saveStoredMealLogs(logs: MealLog[]) {
  writeStorageValue(MEAL_LOGS_KEY, logs);
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent("calorietrack:meal-logs-updated"));
}

export function addStoredMealLog(log: MealLog) {
  const currentLogs = getStoredMealLogs();
  saveStoredMealLogs([log, ...currentLogs]);
  postJson("/api/meals", {
    date: log.date,
    mealType: log.mealType,
    items: log.items.map((item) => ({
      foodId: item.food.id,
      quantity: item.quantity,
    })),
    hungerBefore: log.hungerBefore,
    fullnessAfter: log.fullnessAfter,
    mood: log.mood,
    stressLevel: log.stressLevel,
    notes: log.notes,
  });
}

export function getStoredDailyLog() {
  return readStorageValue(DAILY_LOG_KEY, dailyLog);
}

export function saveStoredDailyLog(log: DailyLog) {
  writeStorageValue(DAILY_LOG_KEY, log);
  if (typeof window === "undefined") {
    return;
  }
  postJson("/api/daily-log", {
    waterIntake: log.waterIntake,
    sleepHours: log.sleepHours,
    cravings: log.cravings,
    steps: log.steps,
    stressLevel: log.stressLevel,
    notes: log.notes,
  });
  window.dispatchEvent(new CustomEvent("calorietrack:daily-log-updated"));
}

export function getStoredSettings() {
  return readStorageValue(SETTINGS_KEY, defaultSettings);
}

export function saveStoredSettings(settings: AppSettings) {
  writeStorageValue(SETTINGS_KEY, settings);
  postJson("/api/settings", settings);
}

export function getStoredMealDraft(defaultDraft: StoredMealDraft) {
  return readStorageValue(MEAL_DRAFT_KEY, defaultDraft);
}

export function saveStoredMealDraft(draft: StoredMealDraft) {
  writeStorageValue(MEAL_DRAFT_KEY, draft);
  if (typeof window === "undefined") {
    return;
  }
  postJson("/api/meal-draft", draft);
  window.dispatchEvent(new CustomEvent("calorietrack:meal-draft-updated"));
}

export function clearStoredMealDraft() {
  if (typeof window === "undefined") {
    return;
  }

  const scopedKey = getScopedStorageKey(MEAL_DRAFT_KEY);
  window.localStorage.removeItem(scopedKey);
  void fetch("/api/meal-draft", { method: "DELETE" }).catch(() => undefined);
  window.dispatchEvent(new CustomEvent("calorietrack:meal-draft-updated"));
}

export function replaceStoredBootstrapData(input: {
  profile: UserProfile;
  settings: AppSettings;
  meals: MealLog[];
  dailyLog: DailyLog;
  mealDraft?: StoredMealDraft | null;
}) {
  if (typeof window === "undefined") {
    return;
  }

  writeStorageValue(PROFILE_KEY, input.profile);
  writeStorageValue(SETTINGS_KEY, input.settings);
  writeStorageValue(MEAL_LOGS_KEY, input.meals);
  writeStorageValue(DAILY_LOG_KEY, input.dailyLog);

  const scopedDraftKey = getScopedStorageKey(MEAL_DRAFT_KEY);
  if (input.mealDraft) {
    window.localStorage.setItem(scopedDraftKey, JSON.stringify(input.mealDraft));
  } else {
    window.localStorage.removeItem(scopedDraftKey);
  }

  window.dispatchEvent(new CustomEvent("calorietrack:profile-updated"));
  window.dispatchEvent(new CustomEvent("calorietrack:meal-logs-updated"));
  window.dispatchEvent(new CustomEvent("calorietrack:daily-log-updated"));
  window.dispatchEvent(new CustomEvent("calorietrack:meal-draft-updated"));
}
