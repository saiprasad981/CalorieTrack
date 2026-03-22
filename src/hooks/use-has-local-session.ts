"use client";

import { useSyncExternalStore } from "react";

import { getStoredSession } from "@/lib/client-persistence";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("calorietrack:session-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("calorietrack:session-updated", callback);
  };
}

function getSnapshot() {
  return Boolean(getStoredSession());
}

function getServerSnapshot() {
  return false;
}

export function useHasLocalSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
