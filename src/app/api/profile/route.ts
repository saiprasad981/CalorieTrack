import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import { profileSchema } from "@/lib/validators";
import { getProfile, updateProfile } from "@/services/user.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    return NextResponse.json({ profile: await getProfile(userId) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = profileSchema.parse(await request.json());
    const currentProfile = await getProfile(userId);

    return NextResponse.json({
      profile: await updateProfile(userId, {
        ...currentProfile,
        age: body.age,
        gender: body.gender,
        height: body.height,
        weight: body.weight,
        goal: body.goal,
        activityLevel: body.activityLevel,
        dailyCalories: body.dailyCalories,
        macroTargets: {
          protein: body.protein,
          carbs: body.carbs,
          fat: body.fat,
          fiber: currentProfile.macroTargets.fiber,
        },
      }),
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
