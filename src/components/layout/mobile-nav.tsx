import Link from "next/link";
import { BarChart3, Home, Salad, Sparkles, User2 } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/meals", label: "Meals", icon: Salad },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User2 },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-full border border-white/50 bg-white/90 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
