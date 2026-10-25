"use client";

import { RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { PreparationEmpty } from "@/components/workflow/preparation-empty";
import { PreparationSummary } from "@/components/workflow/preparation-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/core/skeleton";
import { stagePreparationRoute } from "@/constants/routes";
import {
  useDeletePreparation,
  useGeneratePreparation,
  usePreparation,
} from "@/hooks/use-preparation";
import { useErrorMessage } from "@/hooks/use-error-message";
import { ApiError } from "@/lib/api-client";
import { resolvePreparationType } from "@/lib/preparation";
import { preparationCards } from "@/lib/preparation-cards";
import { formatDaysAgo } from "@/lib/utils";
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
  const t = useTranslations();
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const {
    data: preparation,
    isPending,
    error,
  } = usePreparation(workflowId, stageId);
  const generate = useGeneratePreparation(workflowId, stageId);
  const remove = useDeletePreparation(workflowId, stageId);

  const notify = (cause: unknown) =>
    toast.error(errorMessage(cause, "preparation"), {
      id: "preparation-error",
    });

  const isMissing = error instanceof ApiError && error.status === 404;
  const expectedType = resolvePreparationType(stageType);

  return (
    <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">
          {t("preparation.title")}
        </h2>

        {preparation ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-wider text-subtle">
              {t("preparation.generated", {
                when: formatDaysAgo(preparation.createdAt, locale),
              })}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={remove.isPending}
              onClick={() => remove.mutate(undefined, { onError: notify })}
            >
              <RefreshCw />
              {t("preparation.regenerate")}
            </Button>
          </div>
        ) : (
          expectedType && (
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">
              {t(`preparation.types.${expectedType}`)}
            </span>
          )
        )}
      </header>

      {isPending && !isMissing ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : preparation ? (
        <PreparationSummary
          type={preparation.data.type}
          cards={preparationCards(preparation.data, t)}
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
