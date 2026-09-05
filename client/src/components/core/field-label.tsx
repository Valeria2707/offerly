import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FieldLabel({
  htmlFor,
  className,
  children,
}: {
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "font-mono text-[10px] tracking-[0.12em] text-subtle uppercase",
        className,
      )}
    >
      {children}
    </Label>
  );
}
