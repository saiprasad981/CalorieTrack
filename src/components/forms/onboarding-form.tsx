"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { getStoredProfile, saveStoredProfile } from "@/lib/client-persistence";
import { profileSchema } from "@/lib/validators";
import type { UserProfile } from "@/types/user";

const formSchema = profileSchema.extend({
  goal: z.enum(["lose", "maintain", "gain"]),
});

type FormValues = z.output<typeof formSchema>;

const defaults: FormValues = {
  age: 28,
  gender: "Female",
  height: 165,
  weight: 68,
  goal: "lose",
  activityLevel: "moderate",
  dailyCalories: 1950,
  protein: 125,
  carbs: 205,
  fat: 60,
};

export function OnboardingForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof formSchema>, undefined, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    const profile = getStoredProfile();
    reset({
      age: profile.age ?? defaults.age,
      gender: profile.gender ?? defaults.gender,
      height: profile.height ?? defaults.height,
      weight: profile.weight ?? defaults.weight,
      goal: profile.goal ?? defaults.goal,
      activityLevel: profile.activityLevel ?? defaults.activityLevel,
      dailyCalories: profile.dailyCalories ?? defaults.dailyCalories,
      protein: profile.macroTargets.protein ?? defaults.protein,
      carbs: profile.macroTargets.carbs ?? defaults.carbs,
      fat: profile.macroTargets.fat ?? defaults.fat,
    });
  }, [reset]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const currentProfile = getStoredProfile();
        const nextProfile: UserProfile = {
          ...currentProfile,
          age: values.age,
          gender: values.gender,
          height: values.height,
          weight: values.weight,
          goal: values.goal,
          activityLevel: values.activityLevel,
          dailyCalories: values.dailyCalories,
          macroTargets: {
            ...currentProfile.macroTargets,
            protein: values.protein,
            carbs: values.carbs,
            fat: values.fat,
            fiber: currentProfile.macroTargets.fiber,
          },
        };

        saveStoredProfile(nextProfile);
        router.push("/dashboard");
        router.refresh();
      })}
      className="grid gap-4 md:grid-cols-2"
    >
      {[
        ["age", "Age"],
        ["gender", "Gender"],
        ["height", "Height (cm)"],
        ["weight", "Weight (kg)"],
        ["dailyCalories", "Daily calories"],
        ["protein", "Protein target"],
        ["carbs", "Carb target"],
        ["fat", "Fat target"],
      ].map(([key, label]) => (
        <label key={key} className="space-y-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
          <input
            {...register(key as keyof FormValues)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 dark:border-slate-800 dark:bg-slate-950"
          />
          <span className="text-xs text-rose-500">{errors[key as keyof FormValues]?.message as string | undefined}</span>
        </label>
      ))}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          Save onboarding
        </Button>
      </div>
    </form>
  );
}
