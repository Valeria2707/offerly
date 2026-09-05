"use client";

import { Controller, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function SelectField({
  name,
  label,
  options,
  className,
}: {
  name: string;
  label: string;
  options: readonly string[];
  className?: string;
}) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string | null) || null;
        const items =
          value && !options.includes(value) ? [value, ...options] : options;

        return (
          <Select value={value} onValueChange={field.onChange}>
            <SelectTrigger
              size="sm"
              aria-label={label}
              className={cn(
                "rounded-md border-transparent bg-card font-mono text-[10px] tracking-wider shadow-none disabled:opacity-100",
                className,
              )}
            >
              <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={item}
                  value={item}
                  className="font-mono text-xs"
                >
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }}
    />
  );
}
