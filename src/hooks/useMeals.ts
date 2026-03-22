"use client";

import { useQuery } from "@tanstack/react-query";

export function useMeals() {
  return useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const response = await fetch("/api/meals");
      return response.json();
    },
  });
}
