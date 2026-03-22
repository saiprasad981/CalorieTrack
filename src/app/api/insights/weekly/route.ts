import { NextResponse } from "next/server";

import { getWeeklyInsights } from "@/services/insight.service";

export async function GET() {
  return NextResponse.json(await getWeeklyInsights());
}
