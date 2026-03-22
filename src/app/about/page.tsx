import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="shell py-16">
      <Card className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">About CalorieTrack</h1>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          CalorieTrack is designed to help users understand why they eat the way they do, not just what they ate.
        </p>
      </Card>
    </div>
  );
}
