"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { VacancyListSkeleton } from "@/components/vacancies/vacancy-list-skeleton";
import { VacancyTable } from "@/components/vacancies/vacancy-table";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import {
  useDeleteVacancy,
  useUpdateVacancy,
  useVacancies,
} from "@/hooks/use-vacancies";
import { ApiError } from "@/lib/api-client";
import type { Vacancy } from "@/types/vacancy";

export default function VacancyArchivePage() {
  const { data: vacancies, isPending, error } = useVacancies();
  const updateVacancy = useUpdateVacancy();
  const deleteVacancy = useDeleteVacancy();

  const [toDelete, setToDelete] = useState<Vacancy | null>(null);

  const notify = (cause: unknown) =>
    toast.error(
      cause instanceof ApiError ? cause.message : DEFAULT_API_ERROR_MESSAGE,
      { id: "vacancy-error" },
    );

  const archived = (vacancies ?? []).filter(
    (vacancy) => vacancy.lifecycle === "archived",
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <Link
        href={ROUTES.vacancies}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Мої вакансії
      </Link>

      <header className="grid gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Архів
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPending
            ? "завантаження…"
            : `${archived.length} вакансій прибрано зі списку — етапи й замітки збережено`}
        </p>
      </header>

      <FormError error={error} />

      {toDelete && (
        <ConfirmDialog
          title="Видалити вакансію?"
          description={`«${toDelete.title}» зникне назавжди разом з етапами, підготовкою та замітками.`}
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
        <VacancyTable
          vacancies={archived}
          pending={updateVacancy.isPending || deleteVacancy.isPending}
          emptyMessage="Архів порожній."
          onToggleArchive={(vacancy) =>
            updateVacancy.mutate(
              { vacancyId: vacancy.id, patch: { lifecycle: "active" } },
              { onError: notify },
            )
          }
          onDelete={setToDelete}
        />
      )}
    </div>
  );
}
