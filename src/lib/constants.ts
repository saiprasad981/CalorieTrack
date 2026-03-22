import type { MealType } from "@/types/meal";

export const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meals", label: "Meals" },
  { href: "/history", label: "History" },
  { href: "/saved-meals", label: "Saved" },
  { href: "/insights", label: "Insights" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export const quickActions = [
  "Quick add meal",
  "Repeat breakfast",
  "Save current meal",
  "Log water",
];
