"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import {
  AddVacancyPanel,
  type VacancyImportInput,
} from "@/components/vacancies/add-vacancy-panel";
import { VacancyImportProgress } from "@/components/vacancies/vacancy-import-progress";
import { VacancyListSkeleton } from "@/components/vacancies/vacancy-list-skeleton";
import { VacancySearchInput } from "@/components/vacancies/vacancy-search-input";
import { VacancyStats } from "@/components/vacancies/vacancy-stats";
import { VacancyTable } from "@/components/vacancies/vacancy-table";
import { vacancyImportRoute } from "@/constants/routes";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { CLOSED_STATUSES } from "@/constants/vacancy";
import { useImportVacancy, useVacancies } from "@/hooks/use-vacancies";
import { ApiError } from "@/lib/api-client";
import { filterVacancies } from "@/lib/vacancy-search";

export default function VacanciesPage() {
  const router = useRouter();
  const { data: vacancies, isPending, error } = useVacancies();
  const importVacancy = useImportVacancy();

  const [importSource, setImportSource] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const startImport = (input: VacancyImportInput) => {
    setImportSource("url" in input ? input.url : null);
    importVacancy.mutate(input, {
      onSuccess: (vacancyImport) =>
        router.push(vacancyImportRoute(vacancyImport.id)),
      onError: (cause) =>
        toast.error(
          cause instanceof ApiError ? cause.message : DEFAULT_API_ERROR_MESSAGE,
          { id: "vacancy-import-error" },
        ),
    });
  };

  const closed =
    vacancies?.filter((vacancy) => CLOSED_STATUSES.includes(vacancy.status)) ??
    [];
  const active = (vacancies?.length ?? 0) - closed.length;
  const visible = filterVacancies(vacancies ?? [], query);

  return (
    <>
      {importVacancy.isPending && (
        <div className="absolute inset-0 z-40 flex bg-background">
          <VacancyImportProgress sourceUrl={importSource} />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Мої вакансії
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPending
                ? "завантаження…"
                : `${active} активних · ${closed.length} закритих`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <VacancySearchInput value={query} onChange={setQuery} />

            <AddVacancyPanel
              pending={importVacancy.isPending}
              onImport={startImport}
            />
          </div>
        </header>

        <FormError error={error} />

        {isPending ? (
          <VacancyListSkeleton />
        ) : (
          vacancies && (
            <>
              <VacancyStats vacancies={vacancies} />
              <VacancyTable
                vacancies={visible}
                emptyMessage={
                  query
                    ? `Нічого не знайдено за запитом «${query}».`
                    : "Поки жодної вакансії. Додайте першу за посиланням або текстом."
                }
              />
            </>
          )
        )}
      </div>
    </>
  );
}
