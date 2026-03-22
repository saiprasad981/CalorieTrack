"use client";

import { useQuery } from "@tanstack/react-query";

export function useInsights() {
  return useQuery({
    queryKey: ["insights", "daily"],
    queryFn: async () => {
      const response = await fetch("/api/insights/daily");
      return response.json();
    },
  });
}
