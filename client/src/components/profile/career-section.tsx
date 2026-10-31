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
          placeholder="Senior · 5+ years"
          {...register("preferences.level")}
        />
        <TextField
          id="workFormat"
          label={tf("workFormat")}
          placeholder="Hybrid, 2 days / week"
          {...register("preferences.workFormat")}
        />
        <TextField
          id="expectedSalary"
          label={tf("expectedSalary")}
          placeholder="€90,000 – €110,000 / year"
          {...register("preferences.expectedSalary")}
        />
      </div>
    </SectionCard>
  );
}
