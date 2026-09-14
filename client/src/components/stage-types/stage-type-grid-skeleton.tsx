import { Skeleton } from "@/components/core/skeleton";

const CARDS = 8;

export function StageTypeGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: CARDS }, (_, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
