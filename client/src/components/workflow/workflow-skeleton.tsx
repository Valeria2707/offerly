import { Skeleton } from "@/components/core/skeleton";

const STEPS = 6;

export function WorkflowSkeleton() {
  return (
    <>
      <div className="flex justify-between px-1.5 pt-1.5 pb-1">
        {Array.from({ length: STEPS }, (_, index) => (
          <div key={index} className="grid justify-items-center gap-1.5">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          <div className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-36" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <div className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>

        <div className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </>
  );
}
