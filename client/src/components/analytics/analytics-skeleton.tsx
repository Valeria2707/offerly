import { Skeleton } from "@/components/core/skeleton";

const SUMMARY_CARDS = 4;
const ROWS = 3;
const SECTIONS_PER_ROW = 2;

export function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: SUMMARY_CARDS }, (_, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {Array.from({ length: ROWS }, (_, row) => (
        <div
          key={row}
          className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          {Array.from({ length: SECTIONS_PER_ROW }, (_, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
