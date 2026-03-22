import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="shell py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Starter</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Daily tracking, meals, saved foods, and weekly summaries.</p>
          <Button>Get started</Button>
        </Card>
        <Card className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Premium</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Advanced insights, hidden-calorie alerts, and flexible budget coaching.</p>
          <Button variant="secondary">Join waitlist</Button>
        </Card>
      </div>
    </div>
  );
}
