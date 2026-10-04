"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import {
  AddVacancyPanel,
  type VacancyImportInput,
} from "@/components/vacancies/add-vacancy-panel";
import { VacancyImportProgress } from "@/components/vacancies/vacancy-import-progress";
import { VacancyListSkeleton } from "@/components/vacancies/vacancy-list-skeleton";
import { VacancySearchInput } from "@/components/vacancies/vacancy-search-input";
import { VacancyStats } from "@/components/vacancies/vacancy-stats";
import { VacancyTable } from "@/components/vacancies/vacancy-table";
import { ROUTES, vacancyImportRoute } from "@/constants/routes";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { CLOSED_STATUSES } from "@/constants/vacancy";
import {
  useDeleteVacancy,
  useImportVacancy,
  useUpdateVacancy,
  useVacancies,
} from "@/hooks/use-vacancies";
import { ApiError } from "@/lib/api-client";
import { filterVacancies } from "@/lib/vacancy-search";
import type { Vacancy } from "@/types/vacancy";

export default function VacanciesPage() {
  const router = useRouter();
  const { data: vacancies, isPending, error } = useVacancies();
  const importVacancy = useImportVacancy();
  const updateVacancy = useUpdateVacancy();
  const deleteVacancy = useDeleteVacancy();

  const [importSource, setImportSource] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Vacancy | null>(null);

  const notify = (cause: unknown) =>
    toast.error(
      cause instanceof ApiError ? cause.message : DEFAULT_API_ERROR_MESSAGE,
      { id: "vacancy-error" },
    );

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

  const current = (vacancies ?? []).filter(
    (vacancy) => vacancy.lifecycle !== "archived",
  );
  const archivedCount = (vacancies?.length ?? 0) - current.length;
  const closed = current.filter((vacancy) =>
    CLOSED_STATUSES.includes(vacancy.status),
  );
  const active = current.length - closed.length;
  const visible = filterVacancies(current, query);

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
            {archivedCount > 0 && (
              <Link
                href={ROUTES.vacancyArchive}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Архів · {archivedCount}
              </Link>
            )}

            <VacancySearchInput value={query} onChange={setQuery} />

            <AddVacancyPanel
              pending={importVacancy.isPending}
              onImport={startImport}
            />
          </div>
        </header>

        <FormError error={error} />

        {toDelete && (
          <ConfirmDialog
            title="Видалити вакансію?"
            description={`«${toDelete.title}» зникне назавжди разом з етапами, підготовкою та замітками. Щоб лише прибрати зі списку — архівуйте.`}
            confirmLabel="Видалити"
            pending={deleteVacancy.isPending}
            onCancel={() => setToDelete(null)}
            onConfirm={() =>
              deleteVacancy.mutate(toDelete.id, {
                onSuccess: () => setToDelete(null),
                onError: notify,
              })
            }
          />
        )}

        {isPending ? (
          <VacancyListSkeleton />
        ) : (
          vacancies && (
            <>
              <VacancyStats vacancies={current} />
              <VacancyTable
                vacancies={visible}
                pending={updateVacancy.isPending || deleteVacancy.isPending}
                emptyMessage={
                  query
                    ? `Нічого не знайдено за запитом «${query}».`
                    : "Поки жодної вакансії. Додайте першу за посиланням або текстом."
                }
                onToggleArchive={(vacancy) =>
                  updateVacancy.mutate(
                    { vacancyId: vacancy.id, patch: { lifecycle: "archived" } },
                    { onError: notify },
                  )
                }
                onDelete={setToDelete}
              />
            </>
          )
        )}
      </div>
    </>
  );
}
