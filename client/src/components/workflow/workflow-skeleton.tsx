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

      <div className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </>
  );
}
