"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FieldLabel } from "@/components/core/field-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TagListField({
  name,
  label,
  placeholder = "Додати та Enter",
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  const { control } = useFormContext();
  const [draft, setDraft] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const items = (field.value as string[] | undefined) ?? [];

        const add = () => {
          const value = draft.trim();
          if (!value || items.includes(value)) return setDraft("");
          field.onChange([...items, value]);
          setDraft("");
        };

        return (
          <div className="grid gap-2">
            <FieldLabel>{label}</FieldLabel>

            <div className="flex max-h-28 flex-wrap items-center gap-1.5 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <span
                  key={item}
                  className="flex items-center gap-1 rounded-md bg-muted py-1 pr-1 pl-2.5 font-mono text-[11px]"
                >
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Видалити ${item}`}
                    className="text-subtle"
                    onClick={() =>
                      field.onChange(
                        items.filter((_, position) => position !== index),
                      )
                    }
                  >
                    <X />
                  </Button>
                </span>
              ))}

              <Input
                value={draft}
                placeholder={placeholder}
                aria-label={label}
                className="h-8 w-44 rounded-md border-transparent bg-muted px-2.5 font-mono text-[11px] shadow-none disabled:cursor-default disabled:opacity-100"
                onChange={(event) => setDraft(event.target.value)}
                onBlur={add}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== ",") return;
                  event.preventDefault();
                  add();
                }}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
