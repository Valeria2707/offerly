"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { ConfirmDialog } from "@/components/core/confirm-dialog";
import { Button } from "@/components/ui/button";
import { AddStageDialog } from "@/components/workflow/add-stage-dialog";
import { StageDetails } from "@/components/workflow/stage-details";
import { StageStepper } from "@/components/workflow/stage-stepper";
import { WorkflowSkeleton } from "@/components/workflow/workflow-skeleton";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { useVacancy } from "@/hooks/use-vacancies";
import {
  useAddWorkflowStages,
  useRemoveWorkflowStage,
  useReorderWorkflowStages,
  useStageTypes,
  useUpdateWorkflowStage,
  useVacancyWorkflow,
} from "@/hooks/use-workflow";
import { ApiError } from "@/lib/api-client";
import { initials } from "@/lib/utils";
import { currentStageIndex, stageName, swappedStageIds } from "@/lib/workflow";
import type { StageStatus, WorkflowStage } from "@/types/workflow";

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

  const changeStatus = (stageId: string, status: StageStatus) => {
    if (!workflow) return;
    updateStage.mutate(
      { workflowId: workflow.id, stageId, status },
      { onError: notify },
    );
  };

  const move = (index: number, offset: number) => {
    if (!workflow) return;
    reorderStages.mutate(
      {
        workflowId: workflow.id,
        stageIds: swappedStageIds(workflow.stages, index, offset),
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
          onAdd={(stageTypeIds) =>
            addStages.mutate(
              { workflowId: workflow.id, stageTypeIds },
              { onSuccess: () => setIsAdding(false), onError: notify },
            )
          }
        />
      )}

      {stageToRemove && (
        <ConfirmDialog
          title="Видалити етап?"
          description={`«${stageName(stageToRemove.name)}» зникне зі списку етапів цієї заявки.`}
          confirmLabel="Видалити"
          pending={removeStage.isPending}
          onCancel={() => setStageToRemove(null)}
          onConfirm={confirmRemove}
        />
      )}

      {isPending ? (
        <WorkflowSkeleton />
      ) : (
        selected && (
          <>
            <StageStepper
              stages={stages}
              selectedId={selected.id}
              pending={pending}
              onSelect={setSelectedId}
              onMove={move}
            />

            <StageDetails
              stage={selected}
              pending={pending}
              onStatusChange={(status) => changeStatus(selected.id, status)}
              onRemove={() => setStageToRemove(selected)}
            />
          </>
        )
      )}
    </div>
  );
}
