"use client";

import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";

import { AddRow } from "@/components/core/add-row";
import { BulletListField } from "@/components/core/bullet-list-field";
import { MonthField } from "@/components/core/month-field";
import { RemoveRowButton } from "@/components/core/remove-row-button";
import { SectionCard } from "@/components/profile/section-card";
import { TagListField } from "@/components/core/tag-list-field";
import { TextField } from "@/components/core/text-field";
import { TextareaField } from "@/components/core/textarea-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProfileData, ProfileExperience } from "@/types/profile";

const EMPTY_EXPERIENCE: ProfileExperience = {
  company: "",
  title: "",
  startDate: null,
  endDate: null,
  current: false,
  location: null,
  description: null,
  highlights: [],
  skills: [],
};

export function ExperienceSection() {
  const { control, register, setValue, watch } = useFormContext<ProfileData>();
  const t = useTranslations("profile.experience");
  const tf = useTranslations("profile.fields");
  const experience = useFieldArray({ control, name: "experience" });

  return (
    <SectionCard
      title={t("title")}
      name="experience"
      count={experience.fields.length}
    >
      <div className="grid max-h-[36rem] gap-5 overflow-y-auto pr-1">
        {experience.fields.map((field, index) => {
          const current = watch(`experience.${index}.current`);

          return (
            <article
              key={field.id}
              className="grid gap-5 rounded-xl bg-muted/60 p-5"
            >
              <div className="flex items-end gap-3">
                <div className="grid min-w-0 flex-1 gap-5 md:grid-cols-2">
                  <TextField
                    id={`experience-company-${index}`}
                    label={tf("company")}
                    placeholder="Nordic Freight"
                    className="bg-card"
                    {...register(`experience.${index}.company`)}
                  />
                  <TextField
                    id={`experience-title-${index}`}
                    label={tf("title")}
                    placeholder="Backend Engineer"
                    className="bg-card"
                    {...register(`experience.${index}.title`)}
                  />
                </div>
                <RemoveRowButton
                  label={t("remove")}
                  className="mb-1.5"
                  onClick={() => experience.remove(index)}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <MonthField
                  name={`experience.${index}.startDate`}
                  label={tf("startDate")}
                />
                <MonthField
                  name={`experience.${index}.endDate`}
                  label={tf("endDate")}
                  disabled={current}
                />
                <TextField
                  id={`experience-location-${index}`}
                  label={tf("location")}
                  placeholder="Berlin, DE"
                  className="bg-card"
                  {...register(`experience.${index}.location`)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`experience-current-${index}`}
                  checked={current}
                  onCheckedChange={(checked) =>
                    setValue(`experience.${index}.current`, checked === true)
                  }
                />
                <Label
                  htmlFor={`experience-current-${index}`}
                  className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase"
                >
                  {tf("current")}
                </Label>
              </div>

              <TextareaField
                id={`experience-description-${index}`}
                label={tf("description")}
                rows={2}
                className="bg-card"
                {...register(`experience.${index}.description`)}
              />

              <BulletListField
                name={`experience.${index}.highlights`}
                label={tf("highlights")}
                placeholder={t("highlightPlaceholder")}
              />
              <TagListField
                name={`experience.${index}.skills`}
                label={tf("skills")}
              />
            </article>
          );
        })}
      </div>

      <AddRow
        label={t("add")}
        onAdd={() => experience.append(EMPTY_EXPERIENCE)}
      />
    </SectionCard>
  );
}
