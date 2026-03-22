import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BrainCircuit, Droplets, Sparkles, Target } from "lucide-react";

import { LandingCta } from "@/components/marketing/landing-cta";
import { RedirectAuthenticatedHome } from "@/components/marketing/redirect-authenticated-home";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { marketingLinks, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Smart calorie tracking for real life",
  description:
    "Track calories, macros, satiety, cravings, water, and meal quality in one behavior-aware nutrition app.",
  alternates: {
    canonical: "/",
  },
};

const featureCards = [
  {
    title: "Behavior-aware tracking",
    body: "Track calories, macros, fiber, mood, cravings, sleep, water, and satiety in one fast daily workflow.",
    icon: BrainCircuit,
  },
  {
    title: "What to eat next",
    body: "Get smart suggestions based on protein, fiber, sugar balance, and calories remaining instead of generic meal plans.",
    icon: Sparkles,
  },
  {
    title: "Flexible budgeting",
    body: "Handle weekday and weekend calories, gym-day boosts, and weekly-budget mode without breaking momentum.",
    icon: Target,
  },
];

const highlightStats = [
  { label: "Protein hit rate", value: 82 },
  { label: "Water goal", value: 71 },
  { label: "Satiety quality", value: 76 },
];

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <RedirectAuthenticatedHome />
      <header className="shell sticky top-0 z-30 pt-4">
        <div className="flex items-center justify-between rounded-full border border-white/50 bg-white/75 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {marketingLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="inline-flex">
              <span className="inline-flex h-9 items-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
                Login
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="shell pb-20 pt-10">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-200">
              Smart calorie tracking for real life
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
                Track calories, understand cravings, and build meals that actually keep you full.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                CalorieTrack blends calorie counting, macro tracking, satiety analysis, weekly reports, and food behavior insights into one premium dashboard.
              </p>
            </div>
            <LandingCta />
            <div className="grid gap-3 sm:grid-cols-3">
              {highlightStats.map((stat) => (
                <Card key={stat.label} className="space-y-3 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{stat.label}</span>
                    <span>{stat.value}%</span>
                  </div>
                  <ProgressBar value={stat.value} />
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Today</p>
                  <h2 className="text-3xl font-semibold">1,420 / 1,950 kcal</h2>
                </div>
                <Activity className="h-9 w-9" />
              </div>
            </div>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-3xl bg-slate-50/80 p-4 dark:bg-slate-900/70">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-cyan-500" />
                    <div>
                      <p className="text-sm text-slate-500">Water</p>
                      <p className="text-xl font-semibold text-slate-950 dark:text-white">1.8 / 2.6 L</p>
                    </div>
                  </div>
                </Card>
                <Card className="rounded-3xl bg-slate-50/80 p-4 dark:bg-slate-900/70">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="h-5 w-5 text-violet-500" />
                    <div>
                      <p className="text-sm text-slate-500">Hidden calories</p>
                      <p className="text-xl font-semibold text-slate-950 dark:text-white">Coffee extras flagged</p>
                    </div>
                  </div>
                </Card>
              </div>
              <Card className="rounded-3xl bg-slate-50/80 p-4 dark:bg-slate-900/70">
                <p className="text-sm font-medium text-slate-500">What to eat next</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  A protein and fiber-forward dinner would close today’s gap best.
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Try a lentil bowl, grilled chicken wrap, tofu rice bowl, or yogurt with berries.
                </p>
              </Card>
            </div>
          </Card>
        </section>

        <section id="features" className="mt-24 space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Why it stands out</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">A calorie tracker that explains the behavior behind the numbers.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="space-y-4">
                <feature.icon className="h-10 w-10 rounded-2xl bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="insights" className="mt-24 grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Insight engine</p>
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">From logging to coaching.</h3>
            <ul className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>Low sleep days increase snack calories</li>
              <li>Skipped lunch drives late-night cravings</li>
              <li>High-protein lunches improve fullness scores</li>
              <li>Sugary drinks are quietly breaking calorie targets</li>
            </ul>
          </Card>
          <Card id="pricing" className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">Launch plan</p>
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Start free, scale into premium habits.</h3>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              The foundation supports saved meals, onboarding, dashboard insights, progress reports, and smart suggestions today, with room for barcode scanning and photo recognition later.
            </p>
            <Link href="/signup">
              <Button variant="secondary">Create account</Button>
            </Link>
          </Card>
        </section>
      </main>
    </div>
  );
}
