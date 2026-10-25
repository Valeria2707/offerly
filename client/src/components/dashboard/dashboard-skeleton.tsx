import { Skeleton } from "@/components/core/skeleton";

const STAT_CARDS = 4;
const LIST_ROWS = 3;

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Skeleton className="h-52 rounded-xl" />

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: STAT_CARDS }, (_, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>

      <div className="grid content-start gap-4">
        {[0, 1].map((card) => (
          <div
            key={card}
            className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: LIST_ROWS }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ))}
      </div>

      <div className="grid content-start gap-4">
        {[0, 1, 2].map((card) => (
          <div
            key={card}
            className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
