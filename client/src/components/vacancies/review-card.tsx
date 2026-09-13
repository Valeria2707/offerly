import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ReviewCard({
  title,
  path,
  className,
  children,
}: {
  title: string;
  path: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl bg-card p-6 ring-1 ring-foreground/[0.07]",
        className,
      )}
    >
      <header className="mb-5 flex items-center gap-3">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        <span className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">
          {path}
        </span>
      </header>

      <div className="grid min-w-0 gap-5">{children}</div>
    </section>
  );
}
