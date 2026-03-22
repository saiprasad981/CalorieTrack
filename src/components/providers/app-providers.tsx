"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { AuthAvailabilityProvider } from "@/components/providers/auth-availability";
import { AuthSessionBridge } from "@/components/providers/auth-session-bridge";

type AppProvidersProps = {
  children: React.ReactNode;
  authEnabled: boolean;
};

export function AppProviders({ children, authEnabled }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthAvailabilityProvider authEnabled={authEnabled}>
        {authEnabled ? (
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <AuthSessionBridge />
              {children}
            </QueryClientProvider>
          </SessionProvider>
        ) : (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )}
      </AuthAvailabilityProvider>
    </ThemeProvider>
  );
}
