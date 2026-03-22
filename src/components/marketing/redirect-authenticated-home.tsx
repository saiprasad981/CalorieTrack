"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useHasLocalSession } from "@/hooks/use-has-local-session";

export function RedirectAuthenticatedHome() {
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
