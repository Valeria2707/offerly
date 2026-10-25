import { cn } from "@/lib/utils";

export function MeterRow({
  label,
  percent,
  value,
  barClassName,
}: {
  label: string;
  percent: number;
  value: string;
  barClassName: string;
}) {
  return (
    <li className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
      <span className="truncate">{label}</span>
      <span aria-hidden className="h-2.5 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full", barClassName)}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="min-w-10 text-right font-mono text-xs text-muted-foreground">
        {value}
      </span>
    </li>
  );
}
