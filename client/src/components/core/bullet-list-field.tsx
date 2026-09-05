"use client";

import { Plus, X } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { FieldLabel } from "@/components/core/field-label";
import { FIELD_CLASS } from "@/styles/field-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function BulletListField({
  name,
  label,
  placeholder,
  addLabel = "Додати пункт",
}: {
  name: string;
  label: string;
  placeholder?: string;
  addLabel?: string;
}) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const items = (field.value as string[] | undefined) ?? [];

        return (
          <div className="grid gap-2">
            <FieldLabel>{label}</FieldLabel>

            <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span aria-hidden className="text-subtle">
                    —
                  </span>
                  <Input
                    value={item}
                    placeholder={placeholder}
                    aria-label={`${label} ${index + 1}`}
                    className={cn("h-9 flex-1", FIELD_CLASS)}
                    onChange={(event) =>
                      field.onChange(
                        items.map((value, position) =>
                          position === index ? event.target.value : value,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Видалити пункт"
                    className="text-subtle"
                    onClick={() =>
                      field.onChange(
                        items.filter((_, position) => position !== index),
                      )
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-self-start text-subtle"
              onClick={() => field.onChange([...items, ""])}
            >
              <Plus />
              {addLabel}
            </Button>
          </div>
        );
      }}
    />
  );
}
