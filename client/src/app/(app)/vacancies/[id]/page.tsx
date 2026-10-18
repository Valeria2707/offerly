"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { VacancySummary } from "@/components/vacancies/vacancy-summary";
import { Button } from "@/components/ui/button";
import { AddStageDialog } from "@/components/workflow/add-stage-dialog";
import { StageDetails } from "@/components/workflow/stage-details";
import { StageNotes } from "@/components/workflow/stage-notes";
import { StagePreparation } from "@/components/workflow/stage-preparation";
import { StageQuestions } from "@/components/workflow/stage-questions";
import { StageStepper } from "@/components/workflow/stage-stepper";
import { WorkflowSkeleton } from "@/components/workflow/workflow-skeleton";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { useVacancy } from "@/hooks/use-vacancies";
import {
  useAddStageNote,
  useAddStageQuestion,
  useAddWorkflowStages,
  useRemoveStageNote,
  useRemoveStageQuestion,
  useRemoveWorkflowStage,
  useReorderWorkflowStages,
  useStageTypes,
  useUpdateStageQuestion,
  useUpdateWorkflowStage,
  useVacancyWorkflow,
} from "@/hooks/use-workflow";
import { ApiError } from "@/lib/api-client";
import { hasPreparation } from "@/lib/preparation";
import { initials } from "@/lib/utils";
import { currentStageIndex, movedStageIds, stageName } from "@/lib/workflow";
import type {
  StageQuestionDraft,
  WorkflowStage,
  WorkflowStagePatch,
} from "@/types/workflow";

export default function VacancyWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: vacancy } = useVacancy(id);
  const { data: workflow, isPending, error } = useVacancyWorkflow(id);
  const { data: stageTypes } = useStageTypes();

  const [stageToRemove, setStageToRemove] = useState<WorkflowStage | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addStages = useAddWorkflowStages(id);
  const reorderStages = useReorderWorkflowStages(id);
  const updateStage = useUpdateWorkflowStage(id);
  const removeStage = useRemoveWorkflowStage(id);
  const addNote = useAddStageNote(id);
  const removeNote = useRemoveStageNote(id);
  const addQuestion = useAddStageQuestion(id);
  const updateQuestion = useUpdateStageQuestion(id);
  const removeQuestion = useRemoveStageQuestion(id);

  const notify = (cause: unknown) =>
    toast.error(
      cause instanceof ApiError ? cause.message : DEFAULT_API_ERROR_MESSAGE,
      { id: "workflow-error" },
    );

  const stages = workflow?.stages ?? [];
  const selected =
    stages.find((stage) => stage.id === selectedId) ??
    stages[currentStageIndex(stages)] ??
    stages[0];

  const selectedType = stageTypes?.find(
    (type) => type.id === selected?.stageTypeId,
  );

  const updateSelected = (patch: WorkflowStagePatch) => {
    if (!workflow || !selected) return;
    updateStage.mutate(
      { workflowId: workflow.id, stageId: selected.id, patch },
      { onError: notify },
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

  const createQuestion = (draft: StageQuestionDraft) => {
    if (!workflow || !selected) return;
    addQuestion.mutate(
      { workflowId: workflow.id, stageId: selected.id, draft },
      { onError: notify },
    );
  };

  const saveQuestion = (questionId: string, draft: StageQuestionDraft) => {
    if (!workflow || !selected) return;
    updateQuestion.mutate(
      { workflowId: workflow.id, stageId: selected.id, questionId, draft },
      { onError: notify },
    );
  };

  const deleteQuestion = (questionId: string) => {
    if (!workflow || !selected) return;
    removeQuestion.mutate(
      { workflowId: workflow.id, stageId: selected.id, questionId },
      { onError: notify },
    );
  };

  const createNote = (content: string) => {
    if (!workflow || !selected) return;
    addNote.mutate(
      { workflowId: workflow.id, stageId: selected.id, content },
      { onError: notify },
    );
  };

  const deleteNote = (noteId: string) => {
    if (!workflow || !selected) return;
    removeNote.mutate(
      { workflowId: workflow.id, stageId: selected.id, noteId },
      { onError: notify },
    );
  };

  const pending =
    updateStage.isPending ||
    removeStage.isPending ||
    reorderStages.isPending ||
    addStages.isPending;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-[10px] text-muted-foreground">
            {initials(vacancy?.company ?? "")}
          </span>

          <div className="grid gap-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {vacancy?.title ?? "Етапи заявки"}
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
            Довідник етапів
          </Link>

          {workflow && (
            <Button disabled={pending} onClick={() => setIsAdding(true)}>
              <Plus />
              Додати етап
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
          title="Видалити етап?"
          description={`«${stageName(stageToRemove.name)}» зникне зі списку етапів цієї заявки разом із підготовкою та замітками.`}
          confirmLabel="Видалити"
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
                  />
                )}

                <StageQuestions
                  key={`questions-${selected.id}`}
                  questions={selected.questions}
                  pending={
                    addQuestion.isPending ||
                    updateQuestion.isPending ||
                    removeQuestion.isPending
                  }
                  onAdd={createQuestion}
                  onUpdate={saveQuestion}
                  onRemove={deleteQuestion}
                />
              </div>

              <div className="grid gap-6">
                {vacancy && <VacancySummary vacancy={vacancy} />}

                <StageNotes
                  key={selected.id}
                  notes={selected.notes}
                  pending={addNote.isPending || removeNote.isPending}
                  onAdd={createNote}
                  onRemove={deleteNote}
                />
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
