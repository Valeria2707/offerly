"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { VacancyListSkeleton } from "@/components/vacancies/vacancy-list-skeleton";
import { VacancyTable } from "@/components/vacancies/vacancy-table";
import { ROUTES } from "@/constants/routes";
import {
  useDeleteVacancy,
  useUpdateVacancy,
  useVacancies,
} from "@/hooks/use-vacancies";
import { useWorkflowSummaries } from "@/hooks/use-workflow";
import { useErrorMessage } from "@/hooks/use-error-message";
import type { Vacancy } from "@/types/vacancy";

export default function VacancyArchivePage() {
  const t = useTranslations("vacancies");
  const { data: vacancies, isPending, error } = useVacancies();
  const errorMessage = useErrorMessage();
  const updateVacancy = useUpdateVacancy();
  const deleteVacancy = useDeleteVacancy();

  const [toDelete, setToDelete] = useState<Vacancy | null>(null);

  const notify = (cause: unknown) =>
    toast.error(errorMessage(cause), { id: "vacancy-error" });

  const archived = (vacancies ?? []).filter(
    (vacancy) => vacancy.lifecycle === "archived",
  );
  const { data: summaries } = useWorkflowSummaries(
    archived.map((vacancy) => vacancy.id),
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <Link
        href={ROUTES.vacancies}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("title")}
      </Link>

      <header className="grid gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("archive.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPending
            ? t("loading")
            : t("archive.description", { count: archived.length })}
        </p>
      </header>

      <FormError error={error} />

      {toDelete && (
        <ConfirmDialog
          title={t("delete.title")}
          description={t("delete.archivedDescription", {
            title: toDelete.title,
          })}
          confirmLabel={t("delete.confirm")}
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
          summaries={summaries}
          pending={updateVacancy.isPending || deleteVacancy.isPending}
          emptyMessage={t("archive.empty")}
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
