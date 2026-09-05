"use client";

import { X } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { AddRow } from "@/components/core/add-row";
import { SelectField } from "@/components/core/select-field";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SKILL_LEVELS } from "@/constants/levels";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";
import type { ProfileData } from "@/types/profile";

export function SkillsSection() {
  const { control, register } = useFormContext<ProfileData>();
  const skills = useFieldArray({ control, name: "skills" });

  return (
    <SectionCard
      title="Навички"
      path="data.skills"
      name="skills"
      count={skills.fields.length}
    >
      <div className="grid gap-2">
        <div className="grid max-h-96 gap-2 overflow-y-auto pr-1">
          {skills.fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-2 rounded-lg bg-muted pr-1 pl-3.5"
            >
              <Input
                aria-label="Навичка"
                placeholder="name"
                className={cn("h-10 flex-1 bg-transparent px-0", FIELD_CLASS)}
                {...register(`skills.${index}.name`)}
              />
              <SelectField
                name={`skills.${index}.level`}
                label="level"
                options={SKILL_LEVELS}
                className="w-36"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Видалити навичку"
                className="text-subtle"
                onClick={() => skills.remove(index)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>

        <AddRow
          label="Додати навичку"
          onAdd={() => skills.append({ name: "", level: null })}
        />
      </div>
    </SectionCard>
  );
}
