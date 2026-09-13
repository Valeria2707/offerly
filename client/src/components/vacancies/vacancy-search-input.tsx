"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";

export function VacancySearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle"
      />
      <Input
        type="search"
        value={value}
        placeholder="пошук вакансії…"
        aria-label="Пошук серед доданих вакансій"
        className={cn("h-9 w-60 text-xs", FIELD_CLASS, "pl-9")}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
