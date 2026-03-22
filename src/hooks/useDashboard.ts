"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/today");
      return response.json();
    },
  });
}
