"use client";

import { useFormContext } from "react-hook-form";

import { SectionCard } from "@/components/profile/section-card";
import { TextField } from "@/components/core/text-field";
import type { ProfileData } from "@/types/profile";

export function CareerSection() {
  const { register } = useFormContext<ProfileData>();

  return (
    <SectionCard
      title="Кар’єрний профіль"
      path="data.preferences"
      name="preferences"
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <TextField
          id="desiredPosition"
          label="desiredPosition"
          placeholder="Senior Backend Engineer"
          {...register("preferences.desiredPosition")}
        />
        <TextField
          id="level"
          label="level"
          placeholder="Senior · 5+ years"
          {...register("preferences.level")}
        />
        <TextField
          id="workFormat"
          label="workFormat"
          placeholder="Hybrid, 2 days / week"
          {...register("preferences.workFormat")}
        />
        <TextField
          id="expectedSalary"
          label="expectedSalary"
          placeholder="€90,000 – €110,000 / year"
          {...register("preferences.expectedSalary")}
        />
      </div>
    </SectionCard>
  );
}
