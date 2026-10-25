"use client";

import { useLocale, useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { FieldLabel } from "@/components/core/field-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTH_NUMBERS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 52 }, (_, index) =>
  String(CURRENT_YEAR + 1 - index),
);

const TRIGGER_CLASS =
  "h-11 flex-1 rounded-lg border-transparent bg-muted px-3.5 font-mono text-xs shadow-none disabled:opacity-100";

export function MonthField({
  name,
  label,
  disabled,
  className,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const { control } = useFormContext();
  const t = useTranslations("common.monthField");
  const monthName = new Intl.DateTimeFormat(useLocale(), { month: "short" });

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const [year = "", month = ""] = (
          (field.value as string | null) ?? ""
        ).split("-");

        const commit = (nextYear: string, nextMonth: string) => {
          if (!nextYear) return field.onChange(null);
          field.onChange(nextMonth ? `${nextYear}-${nextMonth}` : nextYear);
        };

        return (
          <div className={className}>
            <div className="grid gap-2">
              <FieldLabel>{label}</FieldLabel>
              <div className="flex gap-2">
                <Select
                  disabled={disabled}
                  value={year || null}
                  onValueChange={(value) =>
                    commit((value as string) ?? "", month)
                  }
                >
                  <SelectTrigger
                    aria-label={`${label}: ${t("year")}`}
                    className={TRIGGER_CLASS}
                  >
                    <SelectValue placeholder={t("year")} />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                        className="font-mono text-xs"
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  disabled={disabled || !year}
                  value={month || null}
                  onValueChange={(value) =>
                    commit(year, (value as string) ?? "")
                  }
                >
                  <SelectTrigger
                    aria-label={`${label}: ${t("month")}`}
                    className={TRIGGER_CLASS}
                  >
                    <SelectValue placeholder={t("month")} />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NUMBERS.map((value) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="font-mono text-xs"
                      >
                        {value} ·{" "}
                        {monthName.format(new Date(2000, Number(value) - 1))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
