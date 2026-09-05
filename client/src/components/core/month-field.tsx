"use client";

import { Controller, useFormContext } from "react-hook-form";

import { FieldLabel } from "@/components/core/field-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  ["01", "Січ"],
  ["02", "Лют"],
  ["03", "Бер"],
  ["04", "Кві"],
  ["05", "Тра"],
  ["06", "Чер"],
  ["07", "Лип"],
  ["08", "Сер"],
  ["09", "Вер"],
  ["10", "Жов"],
  ["11", "Лис"],
  ["12", "Гру"],
] as const;

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
                    aria-label={`${label}: рік`}
                    className={TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="рік" />
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
                    aria-label={`${label}: місяць`}
                    className={TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="місяць" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(([value, title]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="font-mono text-xs"
                      >
                        {value} · {title}
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
