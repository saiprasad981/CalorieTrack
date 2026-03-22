"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoUser } from "@/lib/mock-data";
import { buildProfileFromSignup, getStoredProfile, saveStoredProfile } from "@/lib/client-persistence";
import type { UserProfile } from "@/types/user";

const profileEditorSchema = z.object({
  name: z.string().min(2),
  age: z.coerce.number().min(13).max(100),
  gender: z.string().min(1),
  height: z.coerce.number().min(100).max(240),
  weight: z.coerce.number().min(30).max(300),
  goal: z.enum(["lose", "maintain", "gain"]),
  activityLevel: z.enum(["low", "moderate", "high"]),
  dailyCalories: z.coerce.number().min(1200).max(5000),
  protein: z.coerce.number().min(40).max(300),
  carbs: z.coerce.number().min(50).max(500),
  fat: z.coerce.number().min(20).max(200),
  fiber: z.coerce.number().min(10).max(80),
});

type ProfileEditorValues = z.output<typeof profileEditorSchema>;
const demoProfileFallback = demoUser;

function deriveHealthSummary(profile: UserProfile) {
  const bmi = profile.height && profile.weight ? profile.weight / ((profile.height / 100) * (profile.height / 100)) : 0;

  const focus =
    profile.goal === "lose"
      ? "Built to support fat loss with higher satiety, protein coverage, and realistic weekend flexibility."
      : profile.goal === "gain"
        ? "Built to support muscle gain with a surplus, recovery-friendly macros, and steady meal timing."
        : "Built to support weight maintenance with stable energy and balanced meal quality.";

  return {
    bmi: bmi.toFixed(1),
    focus,
    energy:
      profile.macroTargets.protein >= 120
        ? "Your current protein target should help recovery, energy stability, and better fullness across the day."
        : "Boosting protein slightly would likely improve fullness and recovery.",
  };
}

export function ProfileForm() {
  const [savedMessage, setSavedMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof profileEditorSchema>, undefined, ProfileEditorValues>({
    resolver: zodResolver(profileEditorSchema),
    defaultValues: {
      name: demoProfileFallback.name,
      age: demoProfileFallback.age ?? 28,
      gender: demoProfileFallback.gender ?? "Female",
      height: demoProfileFallback.height ?? 165,
      weight: demoProfileFallback.weight ?? 68,
      goal: demoProfileFallback.goal ?? "lose",
      activityLevel: demoProfileFallback.activityLevel ?? "moderate",
      dailyCalories: demoProfileFallback.dailyCalories,
      protein: demoProfileFallback.macroTargets.protein,
      carbs: demoProfileFallback.macroTargets.carbs,
      fat: demoProfileFallback.macroTargets.fat,
      fiber: demoProfileFallback.macroTargets.fiber,
    },
  });

  useEffect(() => {
    const storedProfile = getStoredProfile();
    reset({
      name: storedProfile.name,
      age: storedProfile.age ?? 28,
      gender: storedProfile.gender ?? "Female",
      height: storedProfile.height ?? 165,
      weight: storedProfile.weight ?? 68,
      goal: storedProfile.goal ?? "lose",
      activityLevel: storedProfile.activityLevel ?? "moderate",
      dailyCalories: storedProfile.dailyCalories,
      protein: storedProfile.macroTargets.protein,
      carbs: storedProfile.macroTargets.carbs,
      fat: storedProfile.macroTargets.fat,
      fiber: storedProfile.macroTargets.fiber,
    });
  }, [reset]);

  const watchedValues = useWatch({ control }) as Partial<ProfileEditorValues>;

  const summaryProfile = useMemo<UserProfile>(() => {
    return {
      ...demoProfileFallback,
      name: watchedValues.name || demoProfileFallback.name,
      age:
        typeof watchedValues.age === "number"
          ? watchedValues.age
          : demoProfileFallback.age,
      gender: watchedValues.gender || demoProfileFallback.gender,
      height:
        typeof watchedValues.height === "number"
          ? watchedValues.height
          : demoProfileFallback.height,
      weight:
        typeof watchedValues.weight === "number"
          ? watchedValues.weight
          : demoProfileFallback.weight,
      goal: watchedValues.goal ?? demoProfileFallback.goal,
      activityLevel:
        watchedValues.activityLevel ?? demoProfileFallback.activityLevel,
      dailyCalories:
        watchedValues.dailyCalories ?? demoProfileFallback.dailyCalories,
      macroTargets: {
        protein:
          watchedValues.protein ?? demoProfileFallback.macroTargets.protein,
        carbs: watchedValues.carbs ?? demoProfileFallback.macroTargets.carbs,
        fat: watchedValues.fat ?? demoProfileFallback.macroTargets.fat,
        fiber: watchedValues.fiber ?? demoProfileFallback.macroTargets.fiber,
      },
    };
  }, [watchedValues]);

  const summary = useMemo(
    () => deriveHealthSummary(summaryProfile),
    [summaryProfile],
  );

  if (!summary) {
    return null;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Card className="space-y-4">
        <p className="text-sm text-slate-500">Current goal</p>
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{summaryProfile.goal}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {summaryProfile.dailyCalories} kcal target with {summaryProfile.flexibleBudget.mode} budget mode.
        </p>
        <div className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-sm text-slate-500">BMI estimate</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{summary.bmi}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{summary.focus}</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <p className="font-semibold text-slate-950 dark:text-white">Health impact summary</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{summary.energy}</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <form
          onSubmit={handleSubmit(async (values) => {
            const rebuilt = buildProfileFromSignup({
              name: values.name,
              email: demoProfileFallback.email,
              age: values.age,
              gender: values.gender,
              height: values.height,
              weight: values.weight,
            });

            const nextProfile: UserProfile = {
              ...summaryProfile,
              ...rebuilt,
              name: values.name,
              goal: values.goal,
              activityLevel: values.activityLevel,
              dailyCalories: values.dailyCalories,
              macroTargets: {
                protein: values.protein,
                carbs: values.carbs,
                fat: values.fat,
                fiber: values.fiber,
              },
            };

            saveStoredProfile(nextProfile);
            reset({
              name: nextProfile.name,
              age: nextProfile.age ?? 28,
              gender: nextProfile.gender ?? "Female",
              height: nextProfile.height ?? 165,
              weight: nextProfile.weight ?? 68,
              goal: nextProfile.goal,
              activityLevel: nextProfile.activityLevel,
              dailyCalories: nextProfile.dailyCalories,
              protein: nextProfile.macroTargets.protein,
              carbs: nextProfile.macroTargets.carbs,
              fat: nextProfile.macroTargets.fat,
              fiber: nextProfile.macroTargets.fiber,
            });
            setSavedMessage("Profile updated successfully.");
          })}
          className="grid gap-4 md:grid-cols-2"
        >
          {[
            ["name", "Full name"],
            ["age", "Age"],
            ["gender", "Gender"],
            ["height", "Height (cm)"],
            ["weight", "Weight (kg)"],
            ["dailyCalories", "Daily calories"],
            ["protein", "Protein"],
            ["carbs", "Carbs"],
            ["fat", "Fat"],
            ["fiber", "Fiber"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
              <input
                {...register(field as keyof ProfileEditorValues)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
              />
              <span className="text-xs text-rose-500">{errors[field as keyof ProfileEditorValues]?.message as string | undefined}</span>
            </label>
          ))}

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Goal</span>
            <select {...register("goal")} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950">
              <option value="lose">Lose</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Activity</span>
            <select {...register("activityLevel")} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950">
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </label>

          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{savedMessage}</p>
            <Button type="submit" disabled={isSubmitting}>
              Save profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
