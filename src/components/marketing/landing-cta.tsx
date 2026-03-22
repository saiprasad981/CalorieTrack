"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { useAuthAvailability } from "@/components/providers/auth-availability";
import { useHasLocalSession } from "@/hooks/use-has-local-session";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  const authEnabled = useAuthAvailability();

  if (!authEnabled) {
    return <LandingCtaLocalOnly />;
  }

  return <LandingCtaWithSession />;
}

function LandingCtaWithSession() {
  const { status } = useSession();
  const hasLocalSession = useHasLocalSession();
  const isAuthenticated = status === "authenticated" || hasLocalSession;

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard">
          <Button size="lg">Open dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/login">
        <Button size="lg">Login</Button>
      </Link>
      <Link href="/signup">
        <Button size="lg" variant="secondary">
          Sign up
        </Button>
      </Link>
    </div>
  );
}

function LandingCtaLocalOnly() {
  const hasLocalSession = useHasLocalSession();

  if (hasLocalSession) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard">
          <Button size="lg">Open dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/login">
        <Button size="lg">Login</Button>
      </Link>
      <Link href="/signup">
        <Button size="lg" variant="secondary">
          Sign up
        </Button>
      </Link>
    </div>
  );
}
