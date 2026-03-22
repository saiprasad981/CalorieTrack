import { Card } from "@/components/ui/card";

export default function FaqPage() {
  return (
    <div className="shell py-16">
      <Card className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">FAQ</h1>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Google auth, MongoDB-backed profiles, and nutrition API integration are scaffolded to scale cleanly from MVP to production.</p>
      </Card>
    </div>
  );
}
