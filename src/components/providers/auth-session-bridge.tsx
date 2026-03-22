"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useAuthAvailability } from "@/components/providers/auth-availability";
import {
  replaceStoredBootstrapData,
  saveStoredSession,
  type StoredMealDraft,
} from "@/lib/client-persistence";
import type { MealLog } from "@/types/meal";
import type { AppSettings } from "@/types/settings";
import type { DailyLog, UserProfile } from "@/types/user";

type BootstrapPayload = {
  profile: UserProfile;
  settings: AppSettings;
  meals: MealLog[];
  dailyLog: DailyLog;
  mealDraft?: StoredMealDraft | null;
};

export function AuthSessionBridge() {
  const authEnabled = useAuthAvailability();

  if (!authEnabled) {
    return null;
  }

  return <AuthSessionBridgeWithSession />;
}

function AuthSessionBridgeWithSession() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) {
      return;
    }

    const email = session.user.email;
    const name = session.user.name || email.split("@")[0] || "User";
    const accountId =
      session.user.id || `google-${email.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    saveStoredSession({
      accountId,
      email,
      name,
    });

    void fetch("/api/bootstrap")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Bootstrap failed");
        }
        return response.json() as Promise<BootstrapPayload>;
      })
      .then((data) => {
        replaceStoredBootstrapData(data);
      })
      .catch(() => undefined);
  }, [session, status]);

  return null;
}
