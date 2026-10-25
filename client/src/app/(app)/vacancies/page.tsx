"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { VacancyBoard } from "@/components/vacancies/vacancy-board";
import { VacancyTable } from "@/components/vacancies/vacancy-table";
import { VacancyViewToggle } from "@/components/vacancies/vacancy-view-toggle";
import type { BoardColumn } from "@/constants/board";
import { ROUTES, vacancyImportRoute } from "@/constants/routes";
import {
  useDeleteVacancy,
  useImportVacancy,
  useUpdateVacancy,
  useVacancies,
} from "@/hooks/use-vacancies";
import { useReminders } from "@/hooks/use-calendar";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useVacancyView } from "@/hooks/use-vacancy-view";
import {
  useMoveOnBoard,
  useStageTypes,
  useWorkflowSummaries,
} from "@/hooks/use-workflow";
import { MissingBoardStageError } from "@/lib/board";
import { filterVacancies } from "@/lib/vacancy-search";
import type { Vacancy } from "@/types/vacancy";

export default function VacanciesPage() {
  const t = useTranslations("vacancies");
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { data: vacancies, isPending, error } = useVacancies();
  const importVacancy = useImportVacancy();
  const updateVacancy = useUpdateVacancy();
  const deleteVacancy = useDeleteVacancy();
  const { data: summaries } = useWorkflowSummaries(
    (vacancies ?? []).map((vacancy) => vacancy.id),
  );

  const [importSource, setImportSource] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Vacancy | null>(null);
  const [view, setView] = useVacancyView();

  const { data: reminders } = useReminders();
  const { data: stageTypes } = useStageTypes();
  const moveOnBoard = useMoveOnBoard();

  const notify = (cause: unknown) =>
    toast.error(errorMessage(cause), { id: "vacancy-error" });

  const moveVacancy = (vacancy: Vacancy, target: BoardColumn) =>
    moveOnBoard.mutate(
      {
        vacancyId: vacancy.id,
        target,
        codes: new Map((stageTypes ?? []).map((type) => [type.id, type.code])),
      },
      {
        onError: (cause) =>
          toast.error(
            cause instanceof MissingBoardStageError
              ? t("board.noStage", { target: t(`board.columns.${target}`) })
              : errorMessage(cause),
            { id: "vacancy-board-error" },
          ),
      },
    );

  const startImport = (input: VacancyImportInput) => {
    setImportSource("url" in input ? input.url : null);
    importVacancy.mutate(input, {
      onSuccess: (vacancyImport) =>
        router.push(vacancyImportRoute(vacancyImport.id)),
      onError: (cause) =>
        toast.error(errorMessage(cause), { id: "vacancy-import-error" }),
    });
  };

  const current = (vacancies ?? []).filter(
    (vacancy) => vacancy.lifecycle !== "archived",
  );
  const archivedCount = (vacancies?.length ?? 0) - current.length;
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
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPending
                ? t("loading")
                : t("counts", {
                    current: current.length,
                    archived: archivedCount,
                  })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {archivedCount > 0 && (
              <Link
                href={ROUTES.vacancyArchive}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t("archiveLink", { count: archivedCount })}
              </Link>
            )}

            <VacancySearchInput value={query} onChange={setQuery} />

            <VacancyViewToggle value={view} onChange={setView} />

            <AddVacancyPanel
              pending={importVacancy.isPending}
              onImport={startImport}
            />
          </div>
        </header>

        <FormError error={error} />

        {toDelete && (
          <ConfirmDialog
            title={t("delete.title")}
            description={t("delete.description", { title: toDelete.title })}
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
          vacancies && (
            <>
              {view === "list" && (
                <VacancyStats
                  total={current.length}
                  summaries={[...(summaries?.values() ?? [])]}
                />
              )}
              {view === "board" ? (
                <VacancyBoard
                  vacancies={visible}
                  summaries={summaries}
                  reminders={reminders ?? []}
                  movingId={
                    moveOnBoard.isPending
                      ? (moveOnBoard.variables?.vacancyId ?? null)
                      : null
                  }
                  onMove={moveVacancy}
                />
              ) : (
                <VacancyTable
                  vacancies={visible}
                  summaries={summaries}
                  pending={updateVacancy.isPending || deleteVacancy.isPending}
                  emptyMessage={
                    query
                      ? t("notFound", { query })
                      : t("empty")
                  }
                  onToggleArchive={(vacancy) =>
                    updateVacancy.mutate(
                      { vacancyId: vacancy.id, patch: { lifecycle: "archived" } },
                      { onError: notify },
                    )
                  }
                  onDelete={setToDelete}
                />
              )}
            </>
          )
        )}
      </div>
    </>
  );
}
