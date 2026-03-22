import { NextResponse } from "next/server";

import { searchFoods } from "../../../../services/food-api.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") ?? "";
    const foods = await searchFoods(query);
    return NextResponse.json({ foods });
  } catch {
    return NextResponse.json({ foods: [] });
  }
}
