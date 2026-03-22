import { isUsdaConfigured } from "@/config/env";
import { foodLibrary } from "@/lib/mock-data";
import { foodSearchSchema } from "@/lib/validators";

type FoodNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
};

type UsdaFood = {
  fdcId?: number;
  description?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  dataType?: string;
  foodNutrients?: FoodNutrient[];
};

type ParsedPortion = {
  amount: number;
  unit: string;
};

function normalizeUnit(unit: string) {
  const normalized = unit.trim().toLowerCase();

  if (["g", "gm", "gram", "grams"].includes(normalized)) return "g";
  if (["kg", "kilogram", "kilograms"].includes(normalized)) return "kg";
  if (["ml", "milliliter", "milliliters"].includes(normalized)) return "ml";
  if (["l", "liter", "liters"].includes(normalized)) return "l";
  if (["piece", "pieces"].includes(normalized)) return "pieces";
  if (["idli", "idlies"].includes(normalized)) return "idlies";
  if (["wrap", "wraps"].includes(normalized)) return "wrap";
  if (["bowl", "bowls"].includes(normalized)) return "bowl";
  if (["roti", "rotis"].includes(normalized)) return "rotis";
  if (["cup", "cups"].includes(normalized)) return "cup";

  return normalized;
}

function parsePortionFromQuery(query: string): ParsedPortion | null {
  const match = query
    .toLowerCase()
    .match(
      /(\d+(?:\.\d+)?)\s*(g|gm|gram|grams|kg|ml|l|liter|liters|piece|pieces|idli|idlies|wrap|wraps|bowl|bowls|roti|rotis|cup|cups)\b/,
    );

  if (!match) {
    return null;
  }

  return {
    amount: Number(match[1]),
    unit: normalizeUnit(match[2]),
  };
}

function getNutrientValue(nutrients: FoodNutrient[], nutrientNames: string[]) {
  const match = nutrients.find((nutrient) =>
    nutrientNames.some(
      (name) => nutrient.nutrientName?.toLowerCase() === name.toLowerCase(),
    ),
  );

  return Number(match?.value ?? 0);
}

function areUnitsComparable(left: string, right: string) {
  const a = normalizeUnit(left);
  const b = normalizeUnit(right);

  const massUnits = new Set(["g", "kg"]);
  const volumeUnits = new Set(["ml", "l"]);

  if (a === b) return true;
  if (massUnits.has(a) && massUnits.has(b)) return true;
  if (volumeUnits.has(a) && volumeUnits.has(b)) return true;

  return false;
}

function convertToBaseUnit(amount: number, unit: string) {
  const normalized = normalizeUnit(unit);

  if (normalized === "kg") return { amount: amount * 1000, unit: "g" };
  if (normalized === "l") return { amount: amount * 1000, unit: "ml" };

  return { amount, unit: normalized };
}

function buildFoodFromUsda(item: UsdaFood, portionFromQuery: ParsedPortion | null) {
  const nutrients = item.foodNutrients ?? [];
  const protein = getNutrientValue(nutrients, ["Protein"]);
  const carbs = getNutrientValue(nutrients, ["Carbohydrate, by difference"]);
  const fat = getNutrientValue(nutrients, ["Total lipid (fat)"]);
  const fiber = getNutrientValue(nutrients, ["Fiber, total dietary"]);
  const sugar = getNutrientValue(nutrients, ["Total Sugars", "Sugars, total including NLEA"]);
  const calories = getNutrientValue(nutrients, ["Energy"]);
  const rawServingSize = Number(item.servingSize ?? 100);
  const rawServingUnit = String(item.servingSizeUnit ?? "g");

  const sumOfMacros = protein + carbs + fat + fiber;
  const likelyPerHundredBase =
    rawServingSize > 0 &&
    sumOfMacros > rawServingSize * 1.15 &&
    ["Branded", "Foundation", "Survey (FNDDS)"].includes(String(item.dataType ?? ""));

  const defaultPortion = convertToBaseUnit(rawServingSize, rawServingUnit);
  const requestedPortion =
    portionFromQuery && areUnitsComparable(portionFromQuery.unit, defaultPortion.unit)
      ? convertToBaseUnit(portionFromQuery.amount, portionFromQuery.unit)
      : null;

  const effectivePortion = requestedPortion ?? defaultPortion;
  const divisor = likelyPerHundredBase ? 100 : Math.max(defaultPortion.amount, 1);
  const factor = effectivePortion.amount / divisor;

  return {
    id: String(item.fdcId),
    name: String(item.description ?? "Food"),
    brand: String(item.brandOwner ?? ""),
    servingSize: Number(effectivePortion.amount.toFixed(1)),
    unit: effectivePortion.unit,
    calories: Number((calories * factor).toFixed(1)),
    protein: Number((protein * factor).toFixed(1)),
    carbs: Number((carbs * factor).toFixed(1)),
    fat: Number((fat * factor).toFixed(1)),
    fiber: Number((fiber * factor).toFixed(1)),
    sugar: Number((sugar * factor).toFixed(1)),
    source: "usda" as const,
    sourceId: String(item.fdcId),
    verified: true,
  };
}

function filterLocalFoods(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return foodLibrary.slice(0, 8);
  }

  return foodLibrary.filter((food) =>
    `${food.name} ${food.brand ?? ""}`.toLowerCase().includes(normalized),
  );
}

export async function searchFoods(query: string) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return filterLocalFoods(normalizedQuery);
  }

  const parsed = foodSearchSchema.parse({ query: normalizedQuery });

  if (!isUsdaConfigured) {
    return filterLocalFoods(parsed.query);
  }

  const portionFromQuery = parsePortionFromQuery(parsed.query);

  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}&query=${encodeURIComponent(parsed.query)}&pageSize=8`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(`USDA request failed with status ${response.status}`);
    }

    const data = (await response.json()) as { foods?: UsdaFood[] };
    const mapped = (data.foods ?? []).map((item) => buildFoodFromUsda(item, portionFromQuery));

    return mapped.length ? mapped : filterLocalFoods(parsed.query);
  } catch {
    return filterLocalFoods(parsed.query);
  }
}
