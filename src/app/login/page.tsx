import Link from "next/link";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/shared/logo";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="shell flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-2xl space-y-6 p-8">
        <Logo />
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Sign in with email or Google to sync meals, health profile, calorie progress, and weekly insights across devices.
            </p>
            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-slate-700 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-slate-300">
              Google sign-up and normal sign-up should both end in the same health setup flow so the app can personalize calories, meal effects, and recommendations.
            </div>
          </div>
          <div className="space-y-4">
            <LoginForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500 dark:bg-slate-950">or continue with</span>
              </div>
            </div>
            <GoogleAuthButton label="Continue with Google" />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link href="/signup" className="font-medium text-blue-700 dark:text-blue-300">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
