"use client";

import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { use, useState } from "react";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { RecruiterCard } from "@/components/vacancies/recruiter-card";
import { VacancySummary } from "@/components/vacancies/vacancy-summary";
import { Button } from "@/components/ui/button";
import { AddStageDialog } from "@/components/workflow/add-stage-dialog";
import { StageDetails } from "@/components/workflow/stage-details";
import { StageNotes } from "@/components/workflow/stage-notes";
import { StagePreparation } from "@/components/workflow/stage-preparation";
import { StageQuestions } from "@/components/workflow/stage-questions";
import { StageStepper } from "@/components/workflow/stage-stepper";
import { WorkflowReminders } from "@/components/workflow/workflow-reminders";
import { WorkflowSkeleton } from "@/components/workflow/workflow-skeleton";
import { ROUTES } from "@/constants/routes";
import { useUpdateVacancy, useVacancy } from "@/hooks/use-vacancies";
import {
  useAddWorkflowStages,
  useRemoveWorkflowStage,
  useReorderWorkflowStages,
  useStageNotes,
  useStageQuestions,
  useStageTypes,
  useUpdateWorkflowStage,
  useVacancyWorkflow,
} from "@/hooks/use-workflow";
import { useNotifyError } from "@/hooks/use-error-message";
import { useStageName } from "@/hooks/use-stage-name";
import { detectLanguage, hasPreparation } from "@/lib/preparation";
import { initials } from "@/lib/utils";
import { currentStageIndex, movedStageIds } from "@/lib/workflow";
import type { WorkflowStage, WorkflowStagePatch } from "@/types/workflow";

export default function VacancyWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const stageName = useStageName();
  const notify = useNotifyError("workflow");

  const { data: vacancy } = useVacancy(id);
  const updateVacancy = useUpdateVacancy();
  const { data: workflow, isPending, error } = useVacancyWorkflow(id);
  const { data: stageTypes } = useStageTypes();

  const [stageToRemove, setStageToRemove] = useState<WorkflowStage | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [now] = useState(() => new Date());
  // Календар веде сюди з конкретним етапом: ?stage=<id>.
  const requestedStageId = useSearchParams().get("stage");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addStages = useAddWorkflowStages(id);
  const reorderStages = useReorderWorkflowStages(id);
  const updateStage = useUpdateWorkflowStage();
  const removeStage = useRemoveWorkflowStage(id);

  const stages = workflow?.stages ?? [];
  const rejectedStage = stages.find((stage) => stage.status === "cancelled");
  const selected =
    rejectedStage ??
    stages.find((stage) => stage.id === (selectedId ?? requestedStageId)) ??
    stages[currentStageIndex(stages)] ??
    stages[0];

  const selectedType = stageTypes?.find(
    (type) => type.id === selected?.stageTypeId,
  );

  const stageRef = {
    vacancyId: id,
    workflowId: workflow?.id,
    stageId: selected?.id,
  };
  const notes = useStageNotes(stageRef);
  const questions = useStageQuestions(stageRef);

  const updateSelected = (patch: WorkflowStagePatch, onDone?: () => void) => {
    if (!workflow || !selected) return;
    updateStage.mutate(
      { vacancyId: id, workflowId: workflow.id, stageId: selected.id, patch },
      { onSuccess: onDone, onError: notify },
    );
  };

  const reorder = (from: number, to: number) => {
    if (!workflow) return;
    reorderStages.mutate(
      {
        workflowId: workflow.id,
        stageIds: movedStageIds(workflow.stages, from, to),
      },
      { onError: notify },
    );
  };

  const confirmRemove = () => {
    if (!workflow || !stageToRemove) return;
    removeStage.mutate(
      { workflowId: workflow.id, stageId: stageToRemove.id },
      { onSuccess: () => setStageToRemove(null), onError: notify },
    );
  };

  const createStages = (stageTypeIds: string[]) => {
    if (!workflow) return;
    addStages.mutate(
      { workflowId: workflow.id, stageTypeIds },
      { onSuccess: () => setIsAdding(false), onError: notify },
    );
  };

  const pending =
    updateStage.isPending ||
    removeStage.isPending ||
    reorderStages.isPending ||
    addStages.isPending;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <Link
        href={
          vacancy?.lifecycle === "archived"
            ? ROUTES.vacancyArchive
            : ROUTES.vacancies
        }
        className="-mb-2 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {vacancy?.lifecycle === "archived"
          ? t("vacancies.archive.title")
          : t("vacancies.title")}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-[10px] text-muted-foreground">
            {initials(vacancy?.company ?? "")}
          </span>

          <div className="grid gap-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {vacancy?.title ?? t("preparation.page.back")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {[vacancy?.company, vacancy?.location]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.stageTypes}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("nav.stageTypes")}
          </Link>

          {workflow && (
            <Button disabled={pending} onClick={() => setIsAdding(true)}>
              <Plus />
              {t("workflow.addStage.title")}
            </Button>
          )}
        </div>
      </header>

      <FormError error={error} />

      {isAdding && workflow && stageTypes && (
        <AddStageDialog
          stageTypes={stageTypes}
          pending={addStages.isPending}
          onClose={() => setIsAdding(false)}
          onAdd={createStages}
        />
      )}

      {stageToRemove && (
        <ConfirmDialog
          title={t("workflow.removeStage.title")}
          description={t("workflow.removeStage.description", {
            name: stageName(stageToRemove.name),
          })}
          confirmLabel={t("common.actions.delete")}
          pending={removeStage.isPending}
          onCancel={() => setStageToRemove(null)}
          onConfirm={confirmRemove}
        />
      )}

      {isPending ? (
        <WorkflowSkeleton />
      ) : (
        workflow &&
        selected && (
          <>
            <StageStepper
              stages={stages}
              selectedId={selected.id}
              lockedId={rejectedStage?.id ?? null}
              pending={pending}
              onSelect={setSelectedId}
              onReorder={reorder}
            />

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="grid gap-6">
                <StageDetails
                  stage={selected}
                  withArtifact={selectedType?.producesArtifact ?? false}
                  pending={pending}
                  frozen={stages.some(
                    (stage) =>
                      stage.status === "cancelled" && stage.id !== selected.id,
                  )}
                  onUpdate={updateSelected}
                  onRemove={() => setStageToRemove(selected)}
                />

                {selectedType && hasPreparation(selectedType) && (
                  <StagePreparation
                    key={selected.id}
                    vacancyId={id}
                    workflowId={workflow.id}
                    stageId={selected.id}
                    stageType={selectedType}
                    vacancyLanguage={detectLanguage(
                      `${vacancy?.title ?? ""} ${vacancy?.description ?? ""}`,
                    )}
                  />
                )}

                <StageQuestions
                  key={`questions-${selected.id}`}
                  questions={selected.questions}
                  pending={questions.pending}
                  onAdd={questions.add}
                  onUpdate={questions.update}
                  onRemove={questions.remove}
                />

                <StageNotes
                  key={`notes-${selected.id}`}
                  notes={selected.notes}
                  pending={notes.pending}
                  onAdd={notes.add}
                  onRemove={notes.remove}
                />
              </div>

              <div className="grid gap-6">
                <WorkflowReminders stages={stages} now={now} />

                {vacancy && (
                  <RecruiterCard
                    vacancy={vacancy}
                    pending={updateVacancy.isPending}
                    onSave={(contact, onDone) =>
                      updateVacancy.mutate(
                        { vacancyId: id, patch: contact },
                        { onSuccess: onDone, onError: notify },
                      )
                    }
                  />
                )}

                {vacancy && <VacancySummary vacancy={vacancy} />}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
