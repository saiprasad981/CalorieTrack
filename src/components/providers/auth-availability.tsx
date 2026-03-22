"use client";

import { createContext, useContext } from "react";

const AuthAvailabilityContext = createContext(true);

export function AuthAvailabilityProvider({
  authEnabled,
  children,
}: {
  authEnabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthAvailabilityContext.Provider value={authEnabled}>
      {children}
    </AuthAvailabilityContext.Provider>
  );
}

export function useAuthAvailability() {
  return useContext(AuthAvailabilityContext);
}
