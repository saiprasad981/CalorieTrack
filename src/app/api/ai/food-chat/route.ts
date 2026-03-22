import { NextResponse } from "next/server";
import { z } from "zod";

import { getAiFoodRecommendation } from "@/services/ai-coach.service";

const schema = z.object({
  prompt: z.string().min(2),
  mode: z.enum(["search", "guidance", "draft-analysis"]),
  draft: z.object({
    calories: z.number(),
    protein: z.number(),
    fiber: z.number(),
    sugar: z.number(),
    mealType: z.string(),
    hungerBefore: z.number(),
    fullnessAfter: z.number(),
    mood: z.string(),
    stressLevel: z.number(),
    foods: z.array(z.string()),
  }),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const result = await getAiFoodRecommendation(
      payload.prompt,
      payload.draft,
      payload.mode,
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        reply: "The AI coach could not answer right now. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
