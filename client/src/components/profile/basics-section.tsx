"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { FieldLabel } from "@/components/core/field-label";
import { LinkRow } from "@/components/profile/link-row";
import { SectionCard } from "@/components/profile/section-card";
import { TextField } from "@/components/core/text-field";
import { TextareaField } from "@/components/core/textarea-field";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/types/profile";

export function BasicsSection() {
  const { control, register } = useFormContext<ProfileData>();
  const links = useFieldArray({ control, name: "basics.links" });

  const filledLinks = (
    useWatch<ProfileData, "basics.links">({ name: "basics.links" }) ?? []
  ).filter((link) => link?.label || link?.url).length;

  return (
    <SectionCard title="Основне" path="data.basics" name="basics">
      <div className="grid gap-5 md:grid-cols-3">
        <TextField
          id="fullName"
          label="fullName"
          placeholder="Olena Kovalchuk"
          {...register("basics.fullName")}
        />
        <TextField
          id="headline"
          label="headline"
          placeholder="Senior Backend Engineer"
          {...register("basics.headline")}
        />
        <TextField
          id="location"
          label="location"
          placeholder="Berlin, DE"
          {...register("basics.location")}
        />
        <TextField
          id="email"
          label="email"
          type="email"
          placeholder="olena@example.com"
          {...register("basics.email")}
        />
        <TextField
          id="phone"
          label="phone"
          placeholder="+380000000000"
          {...register("basics.phone")}
        />
      </div>

      <div className="grid gap-2 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>{`links · ${filledLinks}`}</FieldLabel>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => links.append({ label: "", url: "" })}
          >
            <Plus />
            Додати
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {links.fields.map((field, index) => (
            <LinkRow
              key={field.id}
              index={index}
              onRemove={() => links.remove(index)}
            />
          ))}
        </div>
      </div>

      <TextareaField
        id="summary"
        label="summary"
        rows={3}
        placeholder="Коротко про досвід: стек, роки, галузь…"
        {...register("basics.summary")}
      />
    </SectionCard>
  );
}
