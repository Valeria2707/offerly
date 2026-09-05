"use client";

import { X } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { AddRow } from "@/components/core/add-row";
import { SelectField } from "@/components/core/select-field";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANGUAGE_LEVELS } from "@/constants/levels";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";
import type { ProfileData } from "@/types/profile";

export function LanguagesSection() {
  const { control, register } = useFormContext<ProfileData>();
  const languages = useFieldArray({ control, name: "languages" });

  return (
    <SectionCard
      title="Мови"
      path="data.languages"
      name="languages"
      count={languages.fields.length}
    >
      <div className="grid gap-2">
        <div className="grid max-h-96 gap-2 overflow-y-auto pr-1">
          {languages.fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-2 rounded-lg bg-muted pr-1 pl-3.5"
            >
              <Input
                aria-label="Мова"
                placeholder="name"
                className={cn("h-10 flex-1 bg-transparent px-0", FIELD_CLASS)}
                {...register(`languages.${index}.name`)}
              />
              <SelectField
                name={`languages.${index}.level`}
                label="level"
                options={LANGUAGE_LEVELS}
                className="w-28"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Видалити мову"
                className="text-subtle"
                onClick={() => languages.remove(index)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>

        <AddRow
          label="Додати мову"
          onAdd={() => languages.append({ name: "", level: null })}
        />
      </div>
    </SectionCard>
  );
}
