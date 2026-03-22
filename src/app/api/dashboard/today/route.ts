import { NextResponse } from "next/server";

import { getTodayDashboard } from "@/services/dashboard.service";

export async function GET() {
  return NextResponse.json(await getTodayDashboard());
}
