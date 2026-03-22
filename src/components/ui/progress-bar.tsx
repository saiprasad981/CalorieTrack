import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#06b6d4)] transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
