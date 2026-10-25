"use client";

import { List, SquareKanban } from "lucide-react";
import { useTranslations } from "next-intl";

import { VACANCY_VIEWS, type VacancyView } from "@/constants/board";
import { cn } from "@/lib/utils";

const VIEW_ICONS = { list: List, board: SquareKanban } as const;

export function VacancyViewToggle({
  value,
  onChange,
}: {
  value: VacancyView;
  onChange: (view: VacancyView) => void;
}) {
  const t = useTranslations("vacancies.view");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex h-9 rounded-lg bg-secondary p-[3px]"
    >
      {VACANCY_VIEWS.map((view) => {
        const Icon = VIEW_ICONS[view];

        return (
          <button
            key={view}
            type="button"
            aria-label={t(view)}
            title={t(view)}
            aria-pressed={view === value}
            onClick={() => onChange(view)}
            className={cn(
              "flex w-9 items-center justify-center rounded-md transition-colors",
              view === value
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
