import { Skeleton } from "@/components/core/skeleton";

const BLOCKS = 3;

export function PreparationSkeleton() {
  return (
    <div className="grid gap-6">
      {Array.from({ length: BLOCKS }, (_, index) => (
        <div key={index} className="grid gap-2.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
