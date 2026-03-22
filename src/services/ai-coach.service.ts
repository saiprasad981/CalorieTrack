import { env, isGeminiConfigured } from "@/config/env";

export type AiCoachMode = "search" | "guidance" | "draft-analysis";

type NutritionEstimateInput = {
  name: string;
  quantity: number;
  unit: string;
  mealType: string;
};

type DraftSummary = {
  calories: number;
  protein: number;
  fiber: number;
  sugar: number;
  mealType: string;
  hungerBefore: number;
  fullnessAfter: number;
  mood: string;
  stressLevel: number;
  foods: string[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  modelVersion?: string;
};

const fallbackDashboardQuotes = [
  "Fuel the goal, not just the moment. 💪 One balanced choice today makes tomorrow easier.",
  "Progress is built meal by meal. 🌱 Keep showing up for your body.",
  "You do not need a perfect day, just a better next choice. ✨",
  "Small consistent wins beat extreme plans. 🚀 Eat smart, stay steady.",
  "A strong routine starts with one intentional plate. 🍽️ Keep the momentum going.",
];

async function callGemini(prompt: string) {
  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  );

  url.searchParams.set("key", env.geminiApiKey!);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini request failed", {
      status: response.status,
      statusText: response.statusText,
      body: errorText.slice(0, 500),
    });
    return null;
  }

  return (await response.json()) as GeminiResponse;
}

function buildSystemPrompt(mode: AiCoachMode) {
  if (mode === "search") {
    return `
You are a smart food search assistant inside a calorie tracking app.
Your job is to help users discover foods, meals, and simple combinations that match their query or goal.
Return practical suggestions, not long essays.
Focus on:
- food ideas or meal ideas that fit the query
- healthier alternatives when relevant
- brief reasons tied to protein, fiber, calories, energy, or fullness
If the query is vague, suggest 4 to 6 useful foods or meal options.
Keep the answer under 140 words and format it as short bullet-style lines using "- ".
`;
  }

  if (mode === "draft-analysis") {
    return `
You are a nutrition-focused meal analyst inside a calorie tracking app.
Return valid JSON only with this exact shape:
{"effect":"...","recommendation":"..."}

Rules:
- "effect" explains what the current meal may do for energy, fullness, sugar balance, fat-loss friendliness, and later hunger
- "recommendation" explains what to do next for the user's goal, based on this exact meal
- keep each field under 80 words
- do not use markdown
- do not add extra keys
- do not claim medical certainty
`;
  }

  return `
You are a nutrition-focused health guidance coach inside a calorie tracking app.
Your job is to explain what a food or meal may do for fullness, energy, fat-loss friendliness, protein coverage, sugar balance, and hunger later.
Do not claim medical certainty.
Focus on:
- whether this meal supports fat loss, energy, fullness, and protein/fiber coverage
- what to improve next
- concrete food suggestions for breakfast, lunch, snacks, or dinner
Keep the answer under 140 words.
`;
}

function parseDraftAnalysis(text: string) {
  try {
    const parsed = JSON.parse(text) as {
      effect?: string;
      recommendation?: string;
    };

    if (parsed.effect || parsed.recommendation) {
      return {
        effect:
          parsed.effect?.trim() ??
          "This meal has mixed signals. A little more protein or fiber would usually improve fullness and steadier energy.",
        recommendation:
          parsed.recommendation?.trim() ??
          "For your goal, aim to balance the next meal with lean protein, fiber, and a more controlled sugar load.",
      };
    }
  } catch {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      effect:
        lines[0] ??
        "This meal has mixed signals. A little more protein or fiber would usually improve fullness and steadier energy.",
      recommendation:
        lines.slice(1).join(" ") ||
        "For your goal, aim to balance the next meal with lean protein, fiber, and a more controlled sugar load.",
    };
  }

  return {
    effect:
      "This meal has mixed signals. A little more protein or fiber would usually improve fullness and steadier energy.",
    recommendation:
      "For your goal, aim to balance the next meal with lean protein, fiber, and a more controlled sugar load.",
  };
}

function buildFallbackCoachResponse(mode: AiCoachMode, draft: DraftSummary) {
  if (mode === "search") {
    return {
      reply:
        "I could not reach the AI search helper right now. Try foods with better fullness and energy like eggs, yogurt, oats, fruit, dal, paneer, tofu, rice with protein, or a veggie-heavy bowl.",
      provider: "fallback",
    };
  }

  if (mode === "draft-analysis") {
    const effect =
      draft.sugar > 20 && draft.protein < 15
        ? "This draft may give quick energy but could leave you hungry sooner because sugar is high and protein is low."
        : draft.protein >= 25 && draft.fiber >= 8
          ? "This draft looks more filling and steady because it has stronger protein and fiber coverage."
          : "This draft is workable, but a little more protein or fiber would usually make it more satisfying and goal-friendly.";

    const recommendation =
      draft.protein < 15
        ? "Add a protein anchor next, like eggs, Greek yogurt, paneer, tofu, chicken, or dal."
        : draft.fiber < 5
          ? "Add fruit, oats, vegetables, beans, or lentils to make this more steady and filling."
          : "Keep this portion realistic and make the next meal balanced rather than trying to over-correct.";

    return {
      reply: effect,
      effect,
      recommendation,
      provider: "fallback",
    };
  }

  return {
    reply:
      "I could not reach the AI guidance helper right now. In general, aim for more protein and fiber, and be careful with meals that are mostly sugar or refined carbs.",
    provider: "fallback",
  };
}

function fallbackNutritionEstimate(input: NutritionEstimateInput) {
  const normalized = input.name.toLowerCase();

  const countFromPieces = (defaultWeight: number) => {
    if (input.unit.includes("piece") || input.unit.includes("idli") || input.unit.includes("roti")) {
      return input.quantity;
    }

    return Math.max(1, Math.round(input.quantity / defaultWeight));
  };

  const gramsFromInput = (defaultWeight: number) => {
    if (input.unit === "g") return input.quantity;
    if (input.unit === "kg") return input.quantity * 1000;
    if (input.unit === "ml") return input.quantity;
    if (input.unit === "l") return input.quantity * 1000;
    if (input.unit === "cup") return input.quantity * 240;
    if (input.unit === "bowl") return input.quantity * 180;
    return countFromPieces(defaultWeight) * defaultWeight;
  };

  if (/idli/.test(normalized)) {
    const pieces = input.unit.includes("idli") || input.unit.includes("piece")
      ? input.quantity
      : Math.max(1, Math.round(input.quantity / 40));

    return {
      calories: Math.round(pieces * 58),
      protein: Number((pieces * 2).toFixed(1)),
      fiber: Number((pieces * 0.5).toFixed(1)),
      sugar: Number((pieces * 0.2).toFixed(1)),
    };
  }

  if (/banana|bananna/.test(normalized)) {
    const count = countFromPieces(118);
    return {
      calories: Math.round(count * 105),
      protein: Number((count * 1.3).toFixed(1)),
      fiber: Number((count * 3.1).toFixed(1)),
      sugar: Number((count * 14).toFixed(1)),
    };
  }

  if (/apple/.test(normalized)) {
    const count = countFromPieces(182);
    return {
      calories: Math.round(count * 95),
      protein: Number((count * 0.5).toFixed(1)),
      fiber: Number((count * 4.4).toFixed(1)),
      sugar: Number((count * 19).toFixed(1)),
    };
  }

  if (/orange/.test(normalized)) {
    const count = countFromPieces(131);
    return {
      calories: Math.round(count * 62),
      protein: Number((count * 1.2).toFixed(1)),
      fiber: Number((count * 3.1).toFixed(1)),
      sugar: Number((count * 12).toFixed(1)),
    };
  }

  if (/upma/.test(normalized)) {
    const grams = input.unit === "g" ? input.quantity : input.quantity * 100;
    const factor = grams / 100;
    return {
      calories: Math.round(87 * factor),
      protein: Number((2.4 * factor).toFixed(1)),
      fiber: Number((2.1 * factor).toFixed(1)),
      sugar: Number((1.8 * factor).toFixed(1)),
    };
  }

  if (/rice/.test(normalized)) {
    const grams = input.unit === "g" ? input.quantity : input.quantity * 150;
    const factor = grams / 100;
    return {
      calories: Math.round(130 * factor),
      protein: Number((2.7 * factor).toFixed(1)),
      fiber: Number((0.4 * factor).toFixed(1)),
      sugar: Number((0.1 * factor).toFixed(1)),
    };
  }

  if (/roti|chapati/.test(normalized)) {
    const count = input.unit.includes("roti") || input.unit.includes("piece")
      ? input.quantity
      : Math.max(1, Math.round(input.quantity / 45));
    return {
      calories: Math.round(count * 110),
      protein: Number((count * 3.1).toFixed(1)),
      fiber: Number((count * 2.4).toFixed(1)),
      sugar: Number((count * 0.6).toFixed(1)),
    };
  }

  if (/egg/.test(normalized)) {
    const count = input.unit.includes("piece") ? input.quantity : Math.max(1, Math.round(input.quantity / 50));
    return {
      calories: Math.round(count * 70),
      protein: Number((count * 6).toFixed(1)),
      fiber: 0,
      sugar: 0,
    };
  }

  if (/oats|oatmeal/.test(normalized)) {
    const grams = gramsFromInput(40);
    const factor = grams / 100;
    return {
      calories: Math.round(389 * factor),
      protein: Number((16.9 * factor).toFixed(1)),
      fiber: Number((10.6 * factor).toFixed(1)),
      sugar: Number((0.9 * factor).toFixed(1)),
    };
  }

  return {
    calories: Math.max(50, Math.round(input.quantity * 35)),
    protein: Number(Math.max(1, input.quantity * 0.8).toFixed(1)),
    fiber: Number(Math.max(0.5, input.quantity * 0.4).toFixed(1)),
    sugar: Number(Math.max(0, input.quantity * 0.2).toFixed(1)),
  };
}

function parseNutritionEstimate(text: string, input: NutritionEstimateInput) {
  try {
    const parsed = JSON.parse(text) as {
      calories?: number;
      protein?: number;
      fiber?: number;
      sugar?: number;
    };

    if (
      typeof parsed.calories === "number" &&
      typeof parsed.protein === "number" &&
      typeof parsed.fiber === "number"
    ) {
      return {
        calories: Math.max(0, Math.round(parsed.calories)),
        protein: Math.max(0, Number(parsed.protein.toFixed(1))),
        fiber: Math.max(0, Number(parsed.fiber.toFixed(1))),
        sugar: Math.max(0, Number((parsed.sugar ?? 0).toFixed(1))),
      };
    }
  } catch {
    return fallbackNutritionEstimate(input);
  }

  return fallbackNutritionEstimate(input);
}

export async function estimateNutritionWithAi(input: NutritionEstimateInput) {
  if (!isGeminiConfigured) {
    return fallbackNutritionEstimate(input);
  }

  const data = await callGemini(`You are a nutrition estimation engine inside a calorie tracking app.
Return valid JSON only with this exact shape:
{"calories":123,"protein":4.5,"fiber":2.1,"sugar":12.3}

Estimate the nutrition for this exact serving:
- food: ${input.name}
- quantity: ${input.quantity}
- unit: ${input.unit}
- meal type: ${input.mealType}

Rules:
- estimate calories, protein in grams, fiber in grams, and sugar in grams for this exact serving
- correct obvious common spelling mistakes when possible, like "bananna" -> "banana"
- be practical and realistic for common real-world foods
- do not add markdown
- do not add extra keys`);

  if (!data) {
    return fallbackNutritionEstimate(input);
  }

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return parseNutritionEstimate(reply, input);
}

export async function getAiFoodRecommendation(
  prompt: string,
  draft: DraftSummary,
  mode: AiCoachMode,
) {
  if (!isGeminiConfigured) {
    return buildFallbackCoachResponse(mode, draft);
  }

  const systemPrompt = buildSystemPrompt(mode);
  const userIntentLabel =
    mode === "search"
      ? "User smart food search"
      : mode === "guidance"
        ? "User health guidance request"
        : "User draft meal analysis request";

  const data = await callGemini(`${systemPrompt}

${userIntentLabel}: ${prompt}

Current meal draft:
- Meal type: ${draft.mealType}
- Foods: ${draft.foods.join(", ") || "none"}
- Calories: ${Math.round(draft.calories)}
- Protein: ${Math.round(draft.protein)}g
- Fiber: ${Math.round(draft.fiber)}g
- Sugar: ${Math.round(draft.sugar)}g
- Hunger before: ${draft.hungerBefore}/10
- Fullness after target: ${draft.fullnessAfter}/10
- Mood: ${draft.mood}
- Stress: ${draft.stressLevel}/10`);

  if (!data) {
    return buildFallbackCoachResponse(mode, draft);
  }

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (mode === "draft-analysis") {
    const parsed = parseDraftAnalysis(reply ?? "");

    return {
      reply: parsed.effect,
      effect: parsed.effect,
      recommendation: parsed.recommendation,
      provider: data.modelVersion ?? "gemini",
    };
  }

  return {
    reply: reply ?? buildFallbackCoachResponse(mode, draft).reply,
    provider: data.modelVersion ?? "gemini",
  };
}

export async function getDashboardQuote() {
  const fallback =
    fallbackDashboardQuotes[Math.floor(Date.now() / 1000) % fallbackDashboardQuotes.length];

  if (!isGeminiConfigured) {
    return { quote: fallback, provider: "fallback" };
  }

  const data = await callGemini(`You are writing a short motivational dashboard quote for a calorie tracking app.
Return one fresh quote only.
Rules:
- 1 sentence only
- under 18 words
- positive, modern, and motivating
- include 1 or 2 emojis
- avoid hashtags
- do not use quotation marks`);

  if (!data) {
    return { quote: fallback, provider: "fallback" };
  }

  const quote = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return {
    quote: quote || fallback,
    provider: data.modelVersion ?? "gemini",
  };
}
