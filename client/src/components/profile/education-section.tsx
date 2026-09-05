"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { AddRow } from "@/components/core/add-row";
import { MonthField } from "@/components/core/month-field";
import { RemoveRowButton } from "@/components/core/remove-row-button";
import { SectionCard } from "@/components/profile/section-card";
import { TextField } from "@/components/core/text-field";
import { TextareaField } from "@/components/core/textarea-field";
import type { ProfileData, ProfileEducation } from "@/types/profile";

const EMPTY_EDUCATION: ProfileEducation = {
  institution: "",
  degree: null,
  field: null,
  startDate: null,
  endDate: null,
  description: null,
};

export function EducationSection() {
  const { control, register } = useFormContext<ProfileData>();
  const education = useFieldArray({ control, name: "education" });

  return (
    <SectionCard
      title="Освіта"
      path="data.education"
      name="education"
      count={education.fields.length}
    >
      <div className="grid max-h-[32rem] gap-5 overflow-y-auto pr-1">
        {education.fields.map((field, index) => (
          <article
            key={field.id}
            className="grid gap-5 rounded-xl bg-muted/60 p-5"
          >
            <div className="flex items-end gap-3">
              <TextField
                id={`education-institution-${index}`}
                label="institution"
                placeholder="KNU"
                wrapperClassName="min-w-0 flex-1"
                className="bg-card"
                {...register(`education.${index}.institution`)}
              />
              <RemoveRowButton
                label="Видалити освіту"
                className="mb-1.5"
                onClick={() => education.remove(index)}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                id={`education-degree-${index}`}
                label="degree"
                placeholder="MSc"
                className="bg-card"
                {...register(`education.${index}.degree`)}
              />
              <TextField
                id={`education-field-${index}`}
                label="field"
                placeholder="Computer Science"
                className="bg-card"
                {...register(`education.${index}.field`)}
              />
              <MonthField
                name={`education.${index}.startDate`}
                label="startDate"
              />
              <MonthField name={`education.${index}.endDate`} label="endDate" />
            </div>

            <TextareaField
              id={`education-description-${index}`}
              label="description"
              rows={2}
              className="bg-card"
              {...register(`education.${index}.description`)}
            />
          </article>
        ))}
      </div>

      <AddRow
        label="Додати освіту"
        onAdd={() => education.append(EMPTY_EDUCATION)}
      />
    </SectionCard>
  );
}
