"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password should be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          setError("password", { message: "Invalid email or password." });
          return;
        }

        router.push("/dashboard");
        router.refresh();
      })}
      className="space-y-4"
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</span>
        <input
          {...register("email")}
          type="email"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
          placeholder="you@example.com"
        />
        <span className="text-xs text-rose-500">{errors.email?.message}</span>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</span>
        <input
          {...register("password")}
          type="password"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
          placeholder="Enter your password"
        />
        <span className="text-xs text-rose-500">{errors.password?.message}</span>
      </label>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Normal email login for users who do not use Google</span>
        <Link href="/signup" className="font-medium text-blue-700 dark:text-blue-300">
          Create account
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
