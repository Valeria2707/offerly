import Link from "next/link";

import { VacancyStatusBadge } from "@/components/vacancies/vacancy-status-badge";
import { vacancyRoute } from "@/constants/routes";
import { formatDaysAgo, initials } from "@/lib/utils";
import type { Vacancy } from "@/types/vacancy";

export function VacancyTable({
  vacancies,
  emptyMessage,
}: {
  vacancies: Vacancy[];
  emptyMessage: string;
}) {
  if (vacancies.length === 0) {
    return (
      <p className="rounded-xl bg-card px-6 py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
            <th className="px-6 py-3 font-normal">Вакансія</th>
            <th className="px-4 py-3 font-normal">Етап</th>
            <th className="px-4 py-3 font-normal">Наступний крок</th>
            <th className="px-6 py-3 font-normal">Оновлено</th>
          </tr>
        </thead>

        <tbody>
          {vacancies.map((vacancy) => (
            <tr
              key={vacancy.id}
              className="relative border-b border-border transition-colors last:border-0 hover:bg-muted/60"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-[10px] text-muted-foreground">
                    {initials(vacancy.company)}
                  </span>
                  <span className="grid">
                    <Link
                      href={vacancyRoute(vacancy.id)}
                      className="font-medium underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:underline focus-visible:outline-none"
                    >
                      {vacancy.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {[vacancy.company, vacancy.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </div>
              </td>

              <td className="px-4 py-4">
                <VacancyStatusBadge status={vacancy.status} />
              </td>

              <td className="px-4 py-4 text-muted-foreground">
                {vacancy.nextStep ?? "—"}
              </td>

              <td className="px-6 py-4 font-mono text-xs text-subtle">
                {formatDaysAgo(vacancy.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
