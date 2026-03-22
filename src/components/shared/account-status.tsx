"use client";

import { useEffect, useState } from "react";
import { LogOut, Mail, MoreHorizontal, User2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useAuthAvailability } from "@/components/providers/auth-availability";
import { clearStoredSession, getStoredSession, type LocalSession } from "@/lib/client-persistence";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountStatus() {
  const authEnabled = useAuthAvailability();

  if (!authEnabled) {
    return <AccountStatusLocalOnly />;
  }

  return <AccountStatusWithSession />;
}

function AccountStatusWithSession() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [localSession, setLocalSession] = useState<LocalSession | null>(null);

  useEffect(() => {
    const sync = () => setLocalSession(getStoredSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("calorietrack:session-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("calorietrack:session-updated", sync);
    };
  }, []);

  const sessionUser = session?.user;
  const isAuthenticated = status === "authenticated" && !!sessionUser;
  const isGoogle = session?.user?.provider === "google";
  const displayName = sessionUser?.name || localSession?.name || "Guest";
  const displayEmail = sessionUser?.email || localSession?.email || "Not signed in";

  async function handleLogout() {
    clearStoredSession();

    if (isAuthenticated) {
      await signOut({ callbackUrl: "/login" });
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-slate-50/90 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <User2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {displayName}
              {isAuthenticated ? (isGoogle ? " · Google" : " · Local account") : ""}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span>{displayEmail}</span>
            </div>
          </div>
        </div>
        {isAuthenticated || localSession ? (
          <Button className="mt-4 w-full" variant="outline" size="sm" onClick={() => void handleLogout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        ) : (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Sign in to keep meals, profile, and settings tied to your account.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountStatusLocalOnly() {
  const router = useRouter();
  const [localSession, setLocalSession] = useState<LocalSession | null>(null);

  useEffect(() => {
    const sync = () => setLocalSession(getStoredSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("calorietrack:session-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("calorietrack:session-updated", sync);
    };
  }, []);

  const displayName = localSession?.name || "Guest";
  const displayEmail = localSession?.email || "Not signed in";

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-slate-50/90 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <User2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{displayName}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span>{displayEmail}</span>
            </div>
          </div>
        </div>
        {localSession ? (
          <Button className="mt-4 w-full" variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        ) : (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Sign in to keep meals, profile, and settings tied to your account.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
