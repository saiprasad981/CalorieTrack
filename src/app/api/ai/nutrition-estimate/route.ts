import { NextResponse } from "next/server";
import { z } from "zod";

import { estimateNutritionWithAi } from "@/services/ai-coach.service";

const schema = z.object({
  name: z.string().min(2),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  mealType: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const result = await estimateNutritionWithAi(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
