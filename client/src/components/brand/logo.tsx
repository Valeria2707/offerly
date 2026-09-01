import type * as React from "react";

import { cn } from "@/lib/utils";

export function LogoMark({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 24"
      fill="none"
      aria-hidden
      className={cn("size-6", className)}
      {...props}
    >
      <rect
        x="5.25"
        y="3.25"
        width="21.5"
        height="13.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2 20.75h28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("flex items-center gap-2.5", className)} {...props}>
      <LogoMark />
      <span className="font-heading text-sm font-semibold tracking-[0.2em] uppercase">
        Offerly
      </span>
    </span>
  );
}
