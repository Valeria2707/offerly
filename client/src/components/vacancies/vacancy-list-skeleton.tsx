import { Skeleton } from "@/components/core/skeleton";

const STAT_CARDS = 4;
const TABLE_ROWS = 5;

export function VacancyListSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: STAT_CARDS }, (_, index) => (
          <div
            key={index}
            className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-10" />
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="border-b border-border px-6 py-3">
          <Skeleton className="h-3 w-24" />
        </div>

        {Array.from({ length: TABLE_ROWS }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b border-border px-6 py-4 last:border-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}
