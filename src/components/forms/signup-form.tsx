"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password should be at least 6 characters"),
  age: z.coerce.number().min(13).max(100),
  gender: z.string().min(1, "Select gender"),
  height: z.coerce.number().min(100).max(240),
  weight: z.coerce.number().min(30).max(300),
});

type SignupValues = z.output<typeof signupSchema>;

const fields: Array<{ key: keyof SignupValues; label: string; type?: string; placeholder: string }> = [
  { key: "name", label: "Full name", type: "text", placeholder: "Ava Sharma" },
  { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { key: "password", label: "Password", type: "password", placeholder: "Create a password" },
  { key: "age", label: "Age", type: "number", placeholder: "28" },
  { key: "gender", label: "Gender", type: "text", placeholder: "Female" },
  { key: "height", label: "Height (cm)", type: "number", placeholder: "165" },
  { key: "weight", label: "Weight (kg)", type: "number", placeholder: "68" },
];

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof signupSchema>, undefined, SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      age: 28,
      gender: "",
      height: 165,
      weight: 68,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { message?: string };
          setError("email", { message: data.message ?? "Could not create account." });
          return;
        }

        const loginResult = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (loginResult?.error) {
          setError("password", { message: "Account created, but sign-in failed. Please try logging in." });
          return;
        }

        router.push("/profile");
        router.refresh();
      })}
      className="grid gap-4 md:grid-cols-2"
    >
      {fields.map((field) => (
        <label key={String(field.key)} className="space-y-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{field.label}</span>
          <input
            {...register(field.key)}
            type={field.type}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder={field.placeholder}
          />
          <span className="text-xs text-rose-500">{errors[field.key]?.message as string | undefined}</span>
        </label>
      ))}

      <div className="md:col-span-2 rounded-3xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-slate-700 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-slate-300">
        We collect age, gender, height, and weight at signup so the app can estimate calorie targets, energy needs, fat-loss range, and meal recommendations. Google signup should lead into the same health-profile flow after authentication.
      </div>

      <div className="md:col-span-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Create account
        </Button>
      </div>
    </form>
  );
}
