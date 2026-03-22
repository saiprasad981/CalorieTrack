import Link from "next/link";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { SignupForm } from "@/components/forms/signup-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="shell flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-4xl space-y-6 p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Sign up with email or Google, then let the app use your age, gender, height, and weight to tailor energy, fat-loss, and meal recommendations.
            </p>
            <div className="mt-6 space-y-3 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-slate-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-slate-300">
              <p>Breakfast, lunch, snacks, and dinner are tracked separately.</p>
              <p>The app then explains whether a meal is energizing, heavy, fat-loss friendly, high satiety, or likely to cause cravings later.</p>
            </div>
            <div className="mt-6">
              <GoogleAuthButton label="Sign up with Google" callbackUrl="/onboarding" />
            </div>
          </div>
          <div className="space-y-4">
            <SignupForm />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-700 dark:text-blue-300">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
