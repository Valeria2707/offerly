"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { AddRow } from "@/components/core/add-row";
import { BulletListField } from "@/components/core/bullet-list-field";
import { MonthField } from "@/components/core/month-field";
import { RemoveRowButton } from "@/components/core/remove-row-button";
import { SectionCard } from "@/components/profile/section-card";
import { TagListField } from "@/components/core/tag-list-field";
import { TextField } from "@/components/core/text-field";
import { TextareaField } from "@/components/core/textarea-field";
import type { ProfileData, ProfileProject } from "@/types/profile";

const EMPTY_PROJECT: ProfileProject = {
  name: "",
  description: null,
  url: null,
  startDate: null,
  endDate: null,
  highlights: [],
  skills: [],
};

export function ProjectsSection() {
  const { control, register } = useFormContext<ProfileData>();
  const projects = useFieldArray({ control, name: "projects" });

  return (
    <SectionCard
      title="Проєкти"
      path="data.projects"
      name="projects"
      count={projects.fields.length}
    >
      <div className="grid max-h-[32rem] gap-5 overflow-y-auto pr-1">
        {projects.fields.map((field, index) => (
          <article
            key={field.id}
            className="grid gap-5 rounded-xl bg-muted/60 p-5"
          >
            <div className="flex items-end gap-3">
              <TextField
                id={`project-name-${index}`}
                label="name"
                placeholder="Offerly"
                wrapperClassName="min-w-0 flex-1"
                className="bg-card"
                {...register(`projects.${index}.name`)}
              />
              <RemoveRowButton
                label="Видалити проєкт"
                className="mb-1.5"
                onClick={() => projects.remove(index)}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <MonthField
                name={`projects.${index}.startDate`}
                label="startDate"
              />
              <MonthField name={`projects.${index}.endDate`} label="endDate" />
            </div>

            <TextField
              id={`project-url-${index}`}
              label="url"
              type="url"
              placeholder="https://github.com/…"
              className="bg-card"
              {...register(`projects.${index}.url`)}
            />

            <TextareaField
              id={`project-description-${index}`}
              label="description"
              rows={2}
              className="bg-card"
              {...register(`projects.${index}.description`)}
            />

            <BulletListField
              name={`projects.${index}.highlights`}
              label="highlights"
              placeholder="Що зроблено або який результат"
            />
            <TagListField name={`projects.${index}.skills`} label="skills" />
          </article>
        ))}
      </div>

      <AddRow
        label="Додати проєкт"
        onAdd={() => projects.append(EMPTY_PROJECT)}
      />
    </SectionCard>
  );
}
