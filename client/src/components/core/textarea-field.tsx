import type * as React from "react";

import { FieldLabel } from "@/components/core/field-label";
import { FIELD_CLASS } from "@/styles/field-styles";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextareaFieldProps = React.ComponentProps<typeof Textarea> & {
  id: string;
  label: string;
};

export function TextareaField({
  id,
  label,
  className,
  rows = 3,
  ...props
}: TextareaFieldProps) {
  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        rows={rows}
        className={cn("resize-none py-2.5", FIELD_CLASS, className)}
        {...props}
      />
    </div>
  );
}
