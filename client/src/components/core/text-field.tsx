import type * as React from "react";

import { FieldLabel } from "@/components/core/field-label";
import { FIELD_CLASS } from "@/styles/field-styles";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TextFieldProps = React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  wrapperClassName?: string;
};

export function TextField({
  id,
  label,
  className,
  wrapperClassName,
  ...props
}: TextFieldProps) {
  return (
    <div className={cn("grid gap-2", wrapperClassName)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        className={cn("h-11", FIELD_CLASS, className)}
        {...props}
      />
    </div>
  );
}
