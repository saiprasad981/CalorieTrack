import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import {
  clearCurrentMealDraft,
  getCurrentMealDraft,
  updateCurrentMealDraft,
} from "@/services/user.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    return NextResponse.json({ mealDraft: await getCurrentMealDraft(userId) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const draft = await request.json();
    return NextResponse.json({ mealDraft: await updateCurrentMealDraft(userId, draft) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const userId = await getRequiredUserId();
    await clearCurrentMealDraft(userId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
