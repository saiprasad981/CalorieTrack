import { NextResponse } from "next/server";

import { getDailyInsights } from "@/services/insight.service";

export async function GET() {
  return NextResponse.json({ insights: await getDailyInsights() });
}
