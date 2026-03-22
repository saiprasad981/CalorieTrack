"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useAuthAvailability } from "@/components/providers/auth-availability";
import { useHasLocalSession } from "@/hooks/use-has-local-session";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const authEnabled = useAuthAvailability();

  if (!authEnabled) {
    return <AuthGuardLocalOnly>{children}</AuthGuardLocalOnly>;
  }

  return <AuthGuardWithSession>{children}</AuthGuardWithSession>;
}

function AuthGuardWithSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const hasLocalSession = useHasLocalSession();

  useEffect(() => {
    if (status !== "authenticated" && !hasLocalSession) {
      document.cookie = "calorietrack-auth=; path=/; max-age=0; samesite=lax";
    }
  }, [hasLocalSession, status]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated" && !hasLocalSession) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasLocalSession, pathname, router, status]);

  if (status === "loading") {
    return (
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 px-6 py-12 text-center text-sm text-slate-500 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
        Checking your session...
      </div>
    );
  }

  if (status !== "authenticated" && !hasLocalSession) {
    return null;
  }

  return <>{children}</>;
}

function AuthGuardLocalOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasLocalSession = useHasLocalSession();

  useEffect(() => {
    if (!hasLocalSession) {
      document.cookie = "calorietrack-auth=; path=/; max-age=0; samesite=lax";
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasLocalSession, pathname, router]);

  if (!hasLocalSession) {
    return null;
  }

  return <>{children}</>;
}
