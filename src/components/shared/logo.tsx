import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 font-semibold tracking-tight text-slate-950 dark:text-slate-50">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white shadow-lg shadow-blue-500/30">
        CT
      </span>
      <span className="text-lg">CalorieTrack</span>
    </Link>
  );
}
