import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import { createMeal, listMeals } from "@/services/meal.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    return NextResponse.json({ meals: await listMeals(userId) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const meal = await createMeal(await request.json(), userId);
    return NextResponse.json({ meal }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
