"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useAuthAvailability } from "@/components/providers/auth-availability";
import { useHasLocalSession } from "@/hooks/use-has-local-session";

export function RedirectAuthenticatedHome() {
  const authEnabled = useAuthAvailability();

  if (!authEnabled) {
    return <RedirectAuthenticatedHomeLocalOnly />;
  }

  return <RedirectAuthenticatedHomeWithSession />;
}

function RedirectAuthenticatedHomeWithSession() {
  const router = useRouter();
  const { status } = useSession();
  const hasLocalSession = useHasLocalSession();

  useEffect(() => {
    if (status === "authenticated" || hasLocalSession) {
      router.replace("/dashboard");
    }
  }, [hasLocalSession, router, status]);

  return null;
}

function RedirectAuthenticatedHomeLocalOnly() {
  const router = useRouter();
  const hasLocalSession = useHasLocalSession();

  useEffect(() => {
    if (hasLocalSession) {
      router.replace("/dashboard");
    }
  }, [hasLocalSession, router]);

  return null;
}
