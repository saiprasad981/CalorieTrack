"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function GoogleAuthButton({
  label,
  callbackUrl = "/dashboard",
}: {
  label: string;
  callbackUrl?: string;
}) {
  return (
    <Button
      className="w-full"
      onClick={() => {
        void signIn("google", { callbackUrl });
      }}
    >
      {label}
    </Button>
  );
}
