import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequiredUserId } from "@/lib/server-auth";
import { getDailyLog, upsertDailyLog } from "@/services/user.service";

const dailyLogSchema = z.object({
  waterIntake: z.number().nonnegative(),
  sleepHours: z.number().nonnegative(),
  cravings: z.array(z.string()),
  steps: z.number().nonnegative(),
  stressLevel: z.number().min(1).max(10),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    const date = new Date().toISOString().slice(0, 10);
    return NextResponse.json({ dailyLog: await getDailyLog(userId, date) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const date = new Date().toISOString().slice(0, 10);
    const body = dailyLogSchema.parse(await request.json());
    return NextResponse.json({ dailyLog: await upsertDailyLog(userId, date, body) });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
