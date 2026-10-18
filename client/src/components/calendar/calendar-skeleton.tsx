import { Skeleton } from "@/components/core/skeleton";

const CELLS = 35;

export function CalendarSkeleton() {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: CELLS }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
