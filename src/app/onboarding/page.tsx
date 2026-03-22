import { AppShell } from "@/components/layout/app-shell";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Card } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <AppShell title="Onboarding" description="Set up your profile, calorie targets, macro goals, and flexible budgeting preferences.">
      <Card className="p-6">
        <OnboardingForm />
      </Card>
    </AppShell>
  );
}
