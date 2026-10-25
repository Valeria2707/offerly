import { useTranslations } from "next-intl";
import type * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isValidationKey } from "@/schemas/auth";

type FormFieldProps = React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: string;
};

export function FormField({
  id,
  label,
  error,
  className,
  ...props
}: FormFieldProps) {
  const t = useTranslations("validation");
  const errorId = `${id}-error`;
  const message = error && isValidationKey(error) ? t(error) : error;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn("h-11 rounded-lg bg-card px-3.5", className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}
