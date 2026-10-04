"use client";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PreparationEmpty } from "@/components/workflow/preparation-empty";
import { PreparationSummary } from "@/components/workflow/preparation-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/core/skeleton";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import {
  PREPARATION_ERROR_MESSAGES,
  PREPARATION_TYPE_LABELS,
} from "@/constants/preparation";
import { stagePreparationRoute } from "@/constants/routes";
import {
  useDeletePreparation,
  useGeneratePreparation,
  usePreparation,
} from "@/hooks/use-preparation";
import { ApiError } from "@/lib/api-client";
import { formatDaysAgo } from "@/lib/utils";
import { resolvePreparationType } from "@/lib/preparation";
import { preparationCards } from "@/lib/preparation-cards";
import type { StageType } from "@/types/workflow";

type StagePreparationProps = {
  vacancyId: string;
  workflowId: string;
  stageId: string;
  stageType: StageType;
};

export function StagePreparation({
  vacancyId,
  workflowId,
  stageId,
  stageType,
}: StagePreparationProps) {
  const {
    data: preparation,
    isPending,
    error,
  } = usePreparation(workflowId, stageId);
  const generate = useGeneratePreparation(workflowId, stageId);
  const remove = useDeletePreparation(workflowId, stageId);

  const notify = (cause: unknown) =>
    toast.error(
      cause instanceof ApiError
        ? (PREPARATION_ERROR_MESSAGES[cause.status] ?? cause.message)
        : DEFAULT_API_ERROR_MESSAGE,
      { id: "preparation-error" },
    );

  const isMissing = error instanceof ApiError && error.status === 404;
  const expectedType = resolvePreparationType(stageType);

  return (
    <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">
          Підготовка
        </h2>

        {preparation ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-wider text-subtle">
              згенеровано {formatDaysAgo(preparation.createdAt)}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={remove.isPending}
              onClick={() => remove.mutate(undefined, { onError: notify })}
            >
              <RefreshCw />
              Згенерувати заново
            </Button>
          </div>
        ) : (
          expectedType && (
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">
              {PREPARATION_TYPE_LABELS[expectedType]}
            </span>
          )
        )}
      </header>

      {isPending && !isMissing ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : preparation ? (
        <PreparationSummary
          type={preparation.data.type}
          cards={preparationCards(preparation.data)}
          href={stagePreparationRoute(vacancyId, stageId)}
        />
      ) : (
        <PreparationEmpty
          expectedType={expectedType}
          pending={generate.isPending}
          onGenerate={(input) => generate.mutate(input, { onError: notify })}
        />
      )}
    </section>
  );
}
