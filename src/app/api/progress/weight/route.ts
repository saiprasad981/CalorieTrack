import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import { getWeightProgress } from "@/services/user.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    return NextResponse.json(await getWeightProgress(userId));
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
