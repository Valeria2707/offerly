import { Skeleton } from "@/components/core/skeleton";

const CARD_CLASS = "rounded-2xl bg-card p-6 ring-1 ring-foreground/[0.07]";

export function ImportReviewSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid min-w-0 gap-6">
        <div className={CARD_CLASS}>
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="grid gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-5 h-40 w-full" />
        </div>

        <div className={CARD_CLASS}>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-5 h-11 w-full" />
          <Skeleton className="mt-5 h-11 w-full" />
        </div>
      </div>

      <div className="grid content-start gap-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
