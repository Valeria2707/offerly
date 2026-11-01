"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import { SectionCard } from "@/components/profile/section-card";
import { TextField } from "@/components/core/text-field";
import type { ProfileData } from "@/types/profile";

export function CareerSection() {
  const { register } = useFormContext<ProfileData>();
  const t = useTranslations("profile.career");
  const tf = useTranslations("profile.fields");

  return (
    <SectionCard title={t("title")} name="preferences">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <TextField
          id="desiredPosition"
          label={tf("desiredPosition")}
          placeholder="Senior Backend Engineer"
          {...register("preferences.desiredPosition")}
        />
        <TextField
          id="level"
          label={tf("level")}
          placeholder={t("placeholders.level")}
          {...register("preferences.level")}
        />
        <TextField
          id="workFormat"
          label={tf("workFormat")}
          placeholder={t("placeholders.workFormat")}
          {...register("preferences.workFormat")}
        />
        <TextField
          id="expectedSalary"
          label={tf("expectedSalary")}
          placeholder={t("placeholders.expectedSalary")}
          {...register("preferences.expectedSalary")}
        />
      </div>
    </SectionCard>
  );
}
