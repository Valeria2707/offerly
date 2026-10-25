import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ROUTES, vacancyRoute } from "@/constants/routes";
import {
  STAGE_CATEGORY_CLASSES,
  STAGE_CATEGORY_LABELS,
} from "@/constants/workflow";
import {
  companyMark,
  processNote,
  type ActiveProcess,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function ActiveProcesses({ processes }: { processes: ActiveProcess[] }) {
  return (
    <DashboardCard
      title="Активні процеси"
      link={{ href: ROUTES.vacancies, label: "усі вакансії" }}
    >
      {processes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Активних процесів немає. Додай вакансію, щоб почати.
        </p>
      ) : (
        <ul className="grid gap-2">
          {processes.map((process) => (
            <li key={process.vacancy.id}>
              <Link
                href={vacancyRoute(process.vacancy.id)}
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 transition-colors hover:bg-secondary"
              >
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-[10px] text-muted-foreground"
                >
                  {companyMark(process.vacancy.company)}
                </span>
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-sm font-medium">
                    {process.vacancy.title}
                  </span>
                  <span
                    className={cn(
                      "truncate text-xs",
                      process.silentDays === null
                        ? "text-muted-foreground"
                        : "text-warning",
                    )}
                  >
                    {process.vacancy.company} · {processNote(process)}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase",
                    STAGE_CATEGORY_CLASSES[process.stage.category],
                  )}
                >
                  {STAGE_CATEGORY_LABELS[process.stage.category]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
