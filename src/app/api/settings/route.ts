import { NextResponse } from "next/server";

import { getRequiredUserId } from "@/lib/server-auth";
import { getSettings, updateSettings } from "@/services/user.service";

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    return NextResponse.json(await getSettings(userId));
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const settings = await request.json();
    return NextResponse.json({ settings: await updateSettings(userId, settings) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
