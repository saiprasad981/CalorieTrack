import { NextResponse } from "next/server";

import { getDashboardQuote } from "@/services/ai-coach.service";

export async function GET() {
  try {
    const result = await getDashboardQuote();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      quote: "Small consistent wins beat extreme plans. 🚀 Eat smart, stay steady.",
      provider: "fallback",
    });
  }
}
