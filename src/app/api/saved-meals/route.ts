import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import { createSavedMeal, listSavedMeals } from "@/services/meal.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    return NextResponse.json({ savedMeals: await listSavedMeals(userId) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const savedMeal = await createSavedMeal(await request.json(), userId);
    return NextResponse.json({ savedMeal }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
