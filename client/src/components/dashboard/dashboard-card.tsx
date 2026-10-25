import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  link,
  className,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
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
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold">{title}</h2>
        {link && (
          <Link
            href={link.href}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {link.label}
            <ArrowRight aria-hidden className="size-3" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
