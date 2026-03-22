import { NextResponse } from "next/server";

import { customFoodSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const payload = customFoodSchema.parse(await request.json());
  return NextResponse.json({
    food: {
      id: `custom-${Date.now()}`,
      ...payload,
      source: "custom",
      verified: false,
    },
  });
}
