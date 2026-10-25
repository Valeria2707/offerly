import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { TermList } from "@/components/core/term-list";
import { formatDaysAgo } from "@/lib/utils";
import type { Vacancy } from "@/types/vacancy";

export function VacancySummary({ vacancy }: { vacancy: Vacancy }) {
  const t = useTranslations("vacancies.summary");
  const locale = useLocale();
  const rows = [
    { label: t("salary"), value: vacancy.salaryRange },
    { label: t("workFormat"), value: vacancy.workFormat },
    { label: t("employment"), value: vacancy.employmentType },
    { label: t("level"), value: vacancy.level },
    { label: t("experience"), value: vacancy.experienceRequirement },
    { label: t("education"), value: vacancy.educationRequirement },
    {
      label: t("languages"),
      value: vacancy.languageRequirements.join(", ") || null,
    },
    { label: t("added"), value: formatDaysAgo(vacancy.createdAt, locale) },
  ].filter((row) => row.value);

  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="font-heading text-base font-bold tracking-tight">
        {t("title")}
      </h2>

      <div className="-mr-1 grid max-h-96 gap-4 overflow-y-auto pr-1">
        <dl className="grid gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-3">
              <dt className="w-24 shrink-0 font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
                {row.label}
              </dt>
              <dd className="min-w-0 flex-1 text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>

        {vacancy.requiredSkills.length > 0 && (
          <div className="grid gap-2">
            <h3 className="font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
              {t("skills")}
            </h3>
            <TermList terms={vacancy.requiredSkills} />
          </div>
        )}

        {vacancy.description && (
          <details className="group grid gap-2">
            <summary className="cursor-pointer font-mono text-[10px] tracking-[0.12em] text-subtle uppercase marker:content-[''] hover:text-foreground">
              {t("description")}
              <span aria-hidden className="ml-1 group-open:hidden">
                ▾
              </span>
              <span aria-hidden className="ml-1 hidden group-open:inline">
                ▴
              </span>
            </summary>
            <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
              {vacancy.description}
            </p>
          </details>
        )}
      </div>

      {vacancy.sourceUrl && (
        <a
          href={vacancy.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("original")}
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </section>
  );
}
