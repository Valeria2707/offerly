import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AnalyticsCard({
  title,
  caption,
  className,
  children,
}: {
  title: string;
  caption?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "grid content-start gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10",
        className,
      )}
    >
      <h2 className="font-heading text-base font-bold">{title}</h2>
      {children}
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
    </section>
  );
}
