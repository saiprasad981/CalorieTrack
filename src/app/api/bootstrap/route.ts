import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import { listMeals } from "@/services/meal.service";
import {
  getCurrentMealDraft,
  getDailyLog,
  getProfile,
  getSettings,
} from "@/services/user.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    const today = new Date().toISOString().slice(0, 10);

    const [profile, settings, meals, dailyLog, mealDraft] = await Promise.all([
      getProfile(userId),
      getSettings(userId),
      listMeals(userId),
      getDailyLog(userId, today),
      getCurrentMealDraft(userId),
    ]);

    return NextResponse.json({
      profile,
      settings,
      meals,
      dailyLog,
      mealDraft,
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
