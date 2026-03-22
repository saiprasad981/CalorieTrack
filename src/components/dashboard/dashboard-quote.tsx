"use client";

import { useEffect, useState } from "react";

export function DashboardQuote() {
  const [quote, setQuote] = useState("Loading a fresh boost for today...");

  useEffect(() => {
    let active = true;

    async function loadQuote() {
      try {
        const response = await fetch("/api/ai/dashboard-quote", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load quote");
        }

        const data = (await response.json()) as { quote?: string };
        if (active) {
          setQuote(data.quote || "Small consistent wins beat extreme plans. 🚀 Eat smart, stay steady.");
        }
      } catch {
        if (active) {
          setQuote("Small consistent wins beat extreme plans. 🚀 Eat smart, stay steady.");
        }
      }
    }

    void loadQuote();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-blue-100/80 bg-blue-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-slate-200">
      {quote}
    </div>
  );
}
