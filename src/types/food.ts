export type MacroSplit = {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type FoodItem = MacroSplit & {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  unit: string;
  calories: number;
  sugar?: number;
  source: "usda" | "custom" | "favorite";
  sourceId?: string;
  verified?: boolean;
  category?: string;
};
