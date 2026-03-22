import Link from "next/link";
import { BarChart3, Clock3, Home, Salad, Settings, Sparkles, User2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/meals", label: "Meals", icon: Salad },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/saved-meals", label: "Saved", icon: Sparkles },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 border-r border-white/40 bg-white/60 p-5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/60 lg:flex">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <nav className="mt-6 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] p-5 dark:border-blue-950/70 dark:bg-[linear-gradient(135deg,#172554,#1e293b)]">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick action</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Repeat yesterday&apos;s breakfast or save a real-life meal template in one tap.</p>
        <Button className="mt-4 w-full" size="sm">
          Quick add
        </Button>
      </div>
    </aside>
  );
}
