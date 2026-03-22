"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, HeartPulse, Plus, Search, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  calculateMealQuality,
  calculateMealTotals,
  calculateSatietyScore,
  scaleFood,
} from "@/lib/calculations";
import {
  addStoredMealLog,
  clearStoredMealDraft,
  getStoredMealDraft,
  getStoredProfile,
  saveStoredMealDraft,
} from "@/lib/client-persistence";
import type { FoodItem } from "@/types/food";
import type { MealLog } from "@/types/meal";

type MealDraftItem = {
  food: FoodItem;
  quantity: number;
};

type MealWorkbenchProps = {
  foods: FoodItem[];
  proteinSuggestion: string;
  fiberSuggestion: string;
};

type AiMode = "search" | "guidance";

export function MealWorkbench({
  foods,
  proteinSuggestion,
  fiberSuggestion,
}: MealWorkbenchProps) {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const defaultDraft = useMemo(
    () => ({
      mealType: "breakfast" as const,
      hungerBefore: 5,
      fullnessAfter: 6,
      mood: "energized" as const,
      stressLevel: 3,
      notes: "",
      selectedFoodId: foods[0]?.id ?? "",
      quantity: 100,
      draftItems: [] as MealDraftItem[],
    }),
    [foods],
  );
  const quickLogRef = useRef<HTMLDivElement | null>(null);
  const quantityInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [quantity, setQuantity] = useState(100);
  const [hungerBefore, setHungerBefore] = useState(5);
  const [fullnessAfter, setFullnessAfter] = useState(6);
  const [mood, setMood] = useState("energized");
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0]?.id ?? "");
  const [draftItems, setDraftItems] = useState<MealDraftItem[]>([]);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatReply, setChatReply] = useState(
    "Use Smart food search to discover foods and Health guidance to understand what a food may do for fullness, energy, and fat-loss support.",
  );
  const [chatLoading, setChatLoading] = useState(false);
  const [activeAiMode, setActiveAiMode] = useState<AiMode>("search");
  const [savedMessage, setSavedMessage] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>(foods.slice(0, 6));
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [customFoodName, setCustomFoodName] = useState("");
  const [customQuantity, setCustomQuantity] = useState(2);
  const [customUnit, setCustomUnit] = useState("pieces");
  const [panelMessage, setPanelMessage] = useState("");
  const [aiDraftEffect, setAiDraftEffect] = useState("");
  const [aiDraftRecommendation, setAiDraftRecommendation] = useState("");
  const [draftInsightLoading, setDraftInsightLoading] = useState(false);
  const [customEstimateLoading, setCustomEstimateLoading] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  useEffect(() => {
    const syncProfile = () => setProfile(getStoredProfile());
    syncProfile();
    window.addEventListener("storage", syncProfile);
    window.addEventListener("calorietrack:profile-updated", syncProfile);

    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("calorietrack:profile-updated", syncProfile);
    };
  }, []);

  useEffect(() => {
    const storedDraft = getStoredMealDraft(defaultDraft);
    setMealType(storedDraft.mealType);
    setHungerBefore(storedDraft.hungerBefore);
    setFullnessAfter(storedDraft.fullnessAfter);
    setMood(storedDraft.mood);
    setStressLevel(storedDraft.stressLevel);
    setNotes(storedDraft.notes);
    setSelectedFoodId(storedDraft.selectedFoodId || foods[0]?.id || "");
    setQuantity(storedDraft.quantity);
    setDraftItems(storedDraft.draftItems ?? []);
    setDraftHydrated(true);
  }, [defaultDraft, foods]);

  useEffect(() => {
    if (!draftHydrated) {
      return;
    }

    saveStoredMealDraft({
      mealType: mealType as "breakfast" | "lunch" | "snack" | "dinner",
      hungerBefore,
      fullnessAfter,
      mood: mood as "energized" | "calm" | "stressed" | "tired" | "craving",
      stressLevel,
      notes,
      selectedFoodId,
      quantity,
      draftItems,
    });
  }, [
    draftItems,
    fullnessAfter,
    hungerBefore,
    mealType,
    mood,
    notes,
    quantity,
    selectedFoodId,
    stressLevel,
    draftHydrated,
  ]);

  useEffect(() => {
    const normalized = query.trim();

    if (!normalized) {
      setSearchResults(foods.slice(0, 6));
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const response = await fetch(
          `/api/foods/search?query=${encodeURIComponent(normalized)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Food search failed.");
        }

        const data = (await response.json()) as { foods?: FoodItem[] };
        setSearchResults(data.foods?.length ? data.foods : []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSearchResults([]);
        setSearchError(
          error instanceof Error
            ? error.message
            : "Could not search foods right now.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [foods, query]);

  const availableFoods = useMemo(() => {
    const merged = [...foods, ...searchResults, ...draftItems.map((item) => item.food)];
    const seen = new Map<string, FoodItem>();

    merged.forEach((food) => {
      if (!seen.has(food.id)) {
        seen.set(food.id, food);
      }
    });

    return Array.from(seen.values());
  }, [draftItems, foods, searchResults]);

  const selectedFood =
    availableFoods.find((food) => food.id === selectedFoodId) ?? availableFoods[0];

  const draftTotals = useMemo(() => {
    return draftItems.reduce(
      (acc, item) => {
        const factor = item.quantity / item.food.servingSize;
        acc.calories += item.food.calories * factor;
        acc.protein += item.food.protein * factor;
        acc.fiber += item.food.fiber * factor;
        acc.sugar += (item.food.sugar ?? 0) * factor;
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0, sugar: 0 },
    );
  }, [draftItems]);

  const healthEffect = useMemo(() => {
    if (draftTotals.sugar > 20 && draftTotals.protein < 15) {
      return "This meal may give fast energy but could lead to hunger sooner and make fat loss harder if it becomes a habit.";
    }

    if (draftTotals.protein >= 25 && draftTotals.fiber >= 8) {
      return "This meal should be more filling, better for body composition, and more supportive of stable energy.";
    }

    if (draftTotals.calories > 550) {
      return "This meal is on the heavier side. It can still fit your plan, but pairing it with activity or keeping dinner lighter may help.";
    }

    return "This looks fairly balanced. A bit more protein or fiber would make it even more supportive for energy and appetite control.";
  }, [draftTotals]);

  const localGoalRecommendation = useMemo(() => {
    if (draftItems.length === 0) {
      return `Build your meal draft and I will suggest what to improve for your ${profile.goal ?? "current"} goal right away.`;
    }

    if ((profile.goal ?? "lose") === "lose" && draftTotals.protein < 12 && draftTotals.calories > 250) {
      return "For fat loss, this draft is light on protein for the calories. Add Greek yogurt, eggs, paneer, tofu, dal, or chicken to improve fullness and calorie control.";
    }

    if (draftTotals.sugar > 18 && draftTotals.fiber < 3) {
      return `Because your goal is ${profile.goal ?? "to stay balanced"}, this meal may spike quickly and fade fast. Pair it with nuts, yogurt, fruit with fiber, or a protein source so the next hunger wave stays lower.`;
    }

    if ((profile.goal ?? "lose") === "gain" && draftTotals.protein >= 25) {
      return "For muscle gain, this draft is moving in the right direction. Keep protein solid and add steady carbs if this is around training time.";
    }

    if ((profile.goal ?? "lose") === "maintain" && draftTotals.calories > 650) {
      return "For maintenance, this is a heavier meal. Keep the next meal lighter, prioritize vegetables or fruit, and avoid stacking extra liquid calories right after it.";
    }

    if (draftTotals.calories > Math.max(profile.dailyCalories * 0.35, 650)) {
      return `This draft takes a noticeable chunk of your ${profile.dailyCalories} kcal target. Keep the next meal lighter and prioritize vegetables, fruit, or lean protein.`;
    }

    if (draftTotals.fiber < 4) {
      return `Fiber is still low for your profile target of ${profile.macroTargets.fiber}g. Add fruit, oats, vegetables, beans, or a salad side to make this draft more steady and filling.`;
    }

    return `This draft looks fairly aligned with your ${profile.goal ?? "current"} goal. Keep the portion realistic and your next meal can stay balanced rather than corrective.`;
  }, [draftItems.length, draftTotals, profile.dailyCalories, profile.goal, profile.macroTargets.fiber]);

  useEffect(() => {
    if (draftItems.length === 0) {
      setAiDraftEffect("");
      setAiDraftRecommendation("");
      setDraftInsightLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setDraftInsightLoading(true);

      try {
        const response = await fetch("/api/ai/food-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            prompt:
              "Analyze this current meal draft. Explain what this meal may do and give a goal-aware recommendation based on this exact draft.",
            mode: "draft-analysis",
            draft: {
              calories: draftTotals.calories,
              protein: draftTotals.protein,
              fiber: draftTotals.fiber,
              sugar: draftTotals.sugar,
              mealType,
              hungerBefore,
              fullnessAfter,
              mood,
              stressLevel,
              foods: draftItems.map((item) => item.food.name),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Draft analysis failed.");
        }

        const data = (await response.json()) as {
          effect?: string;
          recommendation?: string;
          reply?: string;
        };

        if (!controller.signal.aborted) {
          setAiDraftEffect(data.effect ?? data.reply ?? "");
          setAiDraftRecommendation(data.recommendation ?? "");
        }
      } catch {
        if (!controller.signal.aborted) {
          setAiDraftEffect("");
          setAiDraftRecommendation("");
        }
      } finally {
        if (!controller.signal.aborted) {
          setDraftInsightLoading(false);
        }
      }
    }, 650);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    draftItems,
    draftTotals,
    fullnessAfter,
    hungerBefore,
    mealType,
    mood,
    stressLevel,
  ]);

  const smartSearchHint = query.trim()
    ? `Discover foods and meal ideas related to "${query.trim()}".`
    : `No search text yet. Smart food search can still suggest foods for your ${mealType}.`;

  const guidanceHint = query.trim()
    ? `Get health guidance for "${query.trim()}".`
    : "No search text yet. Health guidance will analyze your current meal draft.";

  async function runAiMode(mode: AiMode) {
    setActiveAiMode(mode);
    setChatLoading(true);
    setSavedMessage("");

    const fallbackPrompt =
      mode === "search"
        ? query.trim()
          ? `Find foods and meal ideas for: ${query.trim()}`
          : `Suggest smart ${mealType} foods for someone who wants better protein, better fullness, and steady energy.`
        : query.trim()
          ? `Give health guidance for: ${query.trim()}`
          : `Explain the health impact of my current ${mealType} draft and suggest healthier improvements.`;

    try {
      const response = await fetch("/api/ai/food-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: chatPrompt.trim() || fallbackPrompt,
          mode,
          draft: {
            calories: draftTotals.calories,
            protein: draftTotals.protein,
            fiber: draftTotals.fiber,
            sugar: draftTotals.sugar,
            mealType,
            hungerBefore,
            fullnessAfter,
            mood,
            stressLevel,
            foods: draftItems.map((item) => item.food.name),
          },
        }),
      });

      const data = (await response.json()) as { reply?: string };
      setChatReply(data.reply ?? "No recommendation returned.");
    } catch {
      setChatReply("The AI meal coach could not respond right now. Please try again.");
    } finally {
      setChatLoading(false);
    }
  }

  const mealTypeUnits = useMemo(() => {
    if (mealType === "breakfast") {
      return ["idlies", "pieces", "g", "ml", "cup"];
    }

    if (mealType === "lunch" || mealType === "dinner") {
      return ["g", "cup", "pieces", "rotis", "bowl"];
    }

    return ["pieces", "g", "ml", "cup"];
  }, [mealType]);

  function addFoodToDraft(food: FoodItem, customAmount?: number) {
    const amount = customAmount ?? food.servingSize;
    setSelectedFoodId(food.id);
    setQuantity(amount);
    setDraftItems((current) => [...current, { food, quantity: amount }]);
    setSavedMessage(`${food.name} added to your ${mealType} draft.`);
  }

  function loadFoodIntoPanel(food: FoodItem) {
    setSelectedFoodId(food.id);
    setQuantity(food.servingSize);
    setCustomFoodName(food.name);
    setCustomUnit(food.unit);
    setCustomQuantity(food.servingSize);
    setPanelMessage(
      `${food.name} is loaded into the quick log panel. You can now change the quantity before adding it.`,
    );

    window.requestAnimationFrame(() => {
      quickLogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    });
  }

  async function addCustomFoodToDraft() {
    const trimmedName = customFoodName.trim() || query.trim() || `${mealType} custom food`;
    const safeQuantity = Math.max(customQuantity, 1);
    setCustomEstimateLoading(true);

    let estimate = { calories: 0, protein: 0, fiber: 0, sugar: 0 };

    try {
      const response = await fetch("/api/ai/nutrition-estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          quantity: safeQuantity,
          unit: customUnit,
          mealType,
        }),
      });

      if (!response.ok) {
        throw new Error("Nutrition estimate failed.");
      }

      estimate = (await response.json()) as {
        calories: number;
        protein: number;
        fiber: number;
        sugar: number;
      };
    } catch {
      setSavedMessage(
        "Could not estimate nutrition right now. Please try again in a moment.",
      );
      setCustomEstimateLoading(false);
      return;
    }

    const customFood: FoodItem = {
      id: `custom-${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      brand: "Custom",
      servingSize: safeQuantity,
      unit: customUnit,
      calories: Math.max(0, estimate.calories),
      protein: Math.max(0, estimate.protein),
      carbs: 0,
      fat: 0,
      fiber: Math.max(0, estimate.fiber),
      sugar: Math.max(0, estimate.sugar ?? 0),
      source: "custom",
      verified: false,
      category: mealType,
    };

    setSelectedFoodId(customFood.id);
    setDraftItems((current) => [...current, { food: customFood, quantity: safeQuantity }]);
    setSavedMessage(
      `${trimmedName} added with estimated nutrition for ${safeQuantity} ${customUnit}.`,
    );
    setCustomEstimateLoading(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
      <div className="grid gap-5">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Your profile in action
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Goal</p>
              <p className="mt-1 text-lg font-semibold capitalize text-slate-950 dark:text-white">
                {profile.goal ?? "lose"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Daily target</p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {profile.dailyCalories} kcal
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Protein target</p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {profile.macroTargets.protein}g
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Activity</p>
              <p className="mt-1 text-lg font-semibold capitalize text-slate-950 dark:text-white">
                {profile.activityLevel ?? "moderate"}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Food suggestions, meal guidance, calorie comparisons, and protein/fiber coaching now use your saved profile so the app feels tailored to your body stats and goal.
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-3 rounded-3xl bg-slate-50/80 p-4 dark:bg-slate-900/60">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search foods like idli, eggs, rice, yogurt, gym meal..."
              className="h-11 w-full rounded-2xl bg-white px-4 text-sm outline-none dark:bg-slate-950"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => void runAiMode("search")}
              className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 text-left transition hover:border-violet-300 hover:bg-violet-50/70 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-violet-800 dark:hover:bg-violet-950/20"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium text-slate-500">Smart food search</p>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Find foods, meal ideas, and healthier alternatives that match your search or your current meal type.
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {smartSearchHint}
              </p>
            </button>

            <button
              type="button"
              onClick={() => void runAiMode("guidance")}
              className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/70 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium text-slate-500">Health guidance</p>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Explain how a food or meal may affect fullness, energy, fat loss, protein coverage, and sugar balance.
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {guidanceHint}
              </p>
            </button>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {query.trim() ? "Search results" : "Popular foods you can add fast"}
              </p>
              {searchLoading ? (
                <p className="text-xs text-slate-500">Searching...</p>
              ) : null}
            </div>

            {searchError ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
                {searchError}
              </div>
            ) : null}

            {searchResults.length === 0 && query.trim() ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No direct food match found. You can still use Smart food search or add &quot;{query}
                &quot;
                as a custom food below.
              </div>
            ) : null}

            {searchResults.map((food) => (
              <div
                key={food.id}
                className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {food.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {food.brand || "Direct match"} | {food.servingSize}
                      {food.unit} | {food.calories} kcal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => loadFoodIntoPanel(food)}
                    >
                      Use in panel
                    </Button>
                    <Button size="sm" onClick={() => addFoodToDraft(food)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add food
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-500" />
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              AI food recommendation chat
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-full px-3 py-1 ${
                activeAiMode === "search"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              Smart food search = discover foods and meal ideas
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                activeAiMode === "guidance"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              Health guidance = understand what the food may do for your body and goals
            </span>
          </div>

          <textarea
            value={chatPrompt}
            onChange={(event) => setChatPrompt(event.target.value)}
            placeholder="Ask: What is a healthy breakfast? Will this meal help fat loss? What should I eat for more energy?"
            className="min-h-28 w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
          />

          <div className="flex flex-wrap gap-2">
            {[
              "Healthy breakfast ideas",
              "Will this help fat loss?",
              "Need more energy",
              "High protein dinner",
            ].map((prompt) => (
              <Button
                key={prompt}
                size="sm"
                variant="secondary"
                onClick={() => setChatPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void runAiMode("search")}>
              <Sparkles className="mr-2 h-4 w-4" />
              {chatLoading && activeAiMode === "search"
                ? "Searching..."
                : "Smart food search"}
            </Button>
            <Button variant="secondary" onClick={() => void runAiMode("guidance")}>
              <HeartPulse className="mr-2 h-4 w-4" />
              {chatLoading && activeAiMode === "guidance"
                ? "Analyzing..."
                : "Health guidance"}
            </Button>
          </div>

          <div
            className={`rounded-3xl border p-4 text-sm text-slate-700 dark:text-slate-300 ${
              activeAiMode === "guidance"
                ? "border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                : "border-violet-200/70 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/20"
            }`}
          >
            {chatReply}
          </div>
        </Card>
      </div>

      <div ref={quickLogRef} className="grid gap-5">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Quick log panel
          </h2>
          <p className="text-sm text-slate-500">
            Use this panel when you want to adjust the amount before adding the food to your meal.
            Example: load Upma into the panel, then change it from 100g to 180g before adding.
          </p>
          {panelMessage ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-3 text-sm text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/20 dark:text-violet-200">
              {panelMessage}
            </div>
          ) : null}

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Meal type</p>
            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snack">Snack</option>
              <option value="dinner">Dinner</option>
            </select>
          </label>

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Food and quantity</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
              <select
                value={selectedFoodId}
                onChange={(event) => setSelectedFoodId(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                {availableFoods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
              <input
                ref={quantityInputRef}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
              />
              <Button
                onClick={() => {
                  if (!selectedFood) return;
                  addFoodToDraft(selectedFood, quantity);
                  setSavedMessage(
                    `${selectedFood.name} added with ${quantity} ${selectedFood.unit}.`,
                  );
                }}
              >
                Add
              </Button>
            </div>
            {selectedFood ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selected unit: {selectedFood.unit}. Example: if you choose idli and type 2, it
                will log 2 {selectedFood.unit}.
              </p>
            ) : null}
          </label>

          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                  Add your own food directly
                </p>
                <p className="text-sm text-slate-500">
                  Useful for things like 2 idlies, 3 rotis, 180g rice, or 1 bowl curry.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-500">Food name</span>
                <input
                  value={customFoodName}
                  onChange={(event) => setCustomFoodName(event.target.value)}
                  placeholder={query.trim() || "Food name, like idli or rice"}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-500">Unit type</span>
                <select
                  value={customUnit}
                  onChange={(event) => setCustomUnit(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  {mealTypeUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-500">Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={customQuantity}
                  onChange={(event) => setCustomQuantity(Number(event.target.value))}
                  placeholder="Quantity"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void addCustomFoodToDraft()}>
                <Plus className="mr-2 h-4 w-4" />
                {customEstimateLoading ? "Estimating nutrition..." : "Add custom food"}
              </Button>
            </div>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p>
                You only enter the food name, unit, and quantity. The app estimates calories,
                protein, and fiber for that exact serving automatically.
              </p>
              <p>
                Example: Upma + g + 180 means 180g of upma, and the app will estimate the nutrition
                before adding it to your draft.
              </p>
            </div>
          </div>

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Hunger before</p>
            <input
              type="range"
              min={1}
              max={10}
              value={hungerBefore}
              onChange={(event) => setHungerBefore(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {hungerBefore}/10
            </p>
          </label>

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Fullness after</p>
            <input
              type="range"
              min={1}
              max={10}
              value={fullnessAfter}
              onChange={(event) => setFullnessAfter(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {fullnessAfter}/10
            </p>
          </label>

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Mood</p>
            <select
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="energized">Energized</option>
              <option value="calm">Calm</option>
              <option value="stressed">Stressed</option>
              <option value="tired">Tired</option>
              <option value="craving">Craving</option>
            </select>
          </label>

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Stress level</p>
            <input
              type="range"
              min={1}
              max={10}
              value={stressLevel}
              onChange={(event) => setStressLevel(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {stressLevel}/10
            </p>
          </label>

          <label className="space-y-2">
            <p className="text-sm text-slate-500">Notes</p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: Ate idli with chutney, felt hungry again in 2 hours."
              className="min-h-24 w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (!draftItems.length) {
                  setSavedMessage("Add at least one food before saving this meal log.");
                  return;
                }

                const profile = getStoredProfile();
                const items = draftItems.map((item) => scaleFood(item.food, item.quantity));
                const totals = calculateMealTotals(items);

                const nextMealLog: MealLog = {
                  id: `meal-${Date.now()}`,
                  userId: profile.id,
                  date: new Date().toISOString(),
                  mealType: mealType as MealLog["mealType"],
                  items,
                  totalCalories: Number(totals.totalCalories.toFixed(1)),
                  totalProtein: Number(totals.totalProtein.toFixed(1)),
                  totalCarbs: Number(totals.totalCarbs.toFixed(1)),
                  totalFat: Number(totals.totalFat.toFixed(1)),
                  totalFiber: Number(totals.totalFiber.toFixed(1)),
                  protein: Number(totals.totalProtein.toFixed(1)),
                  carbs: Number(totals.totalCarbs.toFixed(1)),
                  fat: Number(totals.totalFat.toFixed(1)),
                  fiber: Number(totals.totalFiber.toFixed(1)),
                  hungerBefore,
                  fullnessAfter,
                  mood: mood as MealLog["mood"],
                  stressLevel,
                  notes,
                };

                nextMealLog.qualityScore = calculateMealQuality(nextMealLog);
                nextMealLog.satietyScore = calculateSatietyScore(nextMealLog);

                addStoredMealLog(nextMealLog);
                clearStoredMealDraft();
                setSavedMessage(
                  `${mealType} saved. Your dashboard should now reflect ${Math.round(nextMealLog.totalCalories)} kcal from this meal.`,
                );
                setDraftItems([]);
                setNotes("");
              }}
            >
              Save meal log
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDraftItems([]);
                setNotes("");
                clearStoredMealDraft();
                setSavedMessage("Meal draft cleared.");
              }}
            >
              Clear draft
            </Button>
          </div>

          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {savedMessage}
          </p>
        </Card>
      </div>

      <div className="grid gap-5">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Current meal draft
          </h2>
          {draftItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Add a food to start building breakfast, lunch, snacks, or dinner.
            </div>
          ) : (
            <div className="space-y-3">
              {draftItems.map((item, index) => (
                <div
                  key={`${item.food.id}-${index}`}
                  className="flex items-center justify-between rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {item.food.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.quantity}
                      {item.food.unit} |{" "}
                      {Math.round(
                        item.food.calories * (item.quantity / item.food.servingSize),
                      )}{" "}
                      kcal
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setDraftItems((current) =>
                        current.filter((_, currentIndex) => currentIndex !== index),
                      );
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Meal health analysis
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Calories</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                {Math.round(draftTotals.calories)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Protein</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                {Math.round(draftTotals.protein)}g
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Fiber</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                {Math.round(draftTotals.fiber)}g
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Sugar</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                {Math.round(draftTotals.sugar)}g
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <p className="font-semibold text-slate-950 dark:text-white">
              What this meal may do
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {draftInsightLoading
                ? "Analyzing this draft..."
                : aiDraftEffect || healthEffect}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              This section explains the likely effect of your current draft on energy, fullness, and hunger later.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-950 dark:text-white">
              Goal-aware recommendations
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {draftInsightLoading
                ? "Personalizing your next move..."
                : aiDraftRecommendation || localGoalRecommendation}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {!draftItems.length
                ? `${proteinSuggestion} ${fiberSuggestion}`
                : "This section tells you what to do next for your goal after looking at the current meal draft, not just what the meal does on its own."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
