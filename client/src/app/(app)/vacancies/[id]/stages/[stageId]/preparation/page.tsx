"use client";

import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use, useState } from "react";

import { FormError } from "@/components/auth/form-error";
import { Skeleton } from "@/components/core/skeleton";
import { Button } from "@/components/ui/button";
import { PreparationCardView } from "@/components/workflow/preparation-card-view";
import { PreparationProgress } from "@/components/workflow/preparation-progress";
import { StageNotes } from "@/components/workflow/stage-notes";
import { vacancyRoute } from "@/constants/routes";
import {
  useAnswerPreparationQuestion,
  usePreparation,
  useReviewPreparationAnswer,
} from "@/hooks/use-preparation";
import { useNotifyError } from "@/hooks/use-error-message";
import { useStageName } from "@/hooks/use-stage-name";
import { useVacancy } from "@/hooks/use-vacancies";
import { useStageNotes, useVacancyWorkflow } from "@/hooks/use-workflow";
import { ApiError } from "@/lib/api-client";
import { preparationCards, questionPosition } from "@/lib/preparation-cards";

export default function StagePreparationPage({
  params,
}: {
  params: Promise<{ id: string; stageId: string }>;
}) {
  const { id, stageId } = use(params);
  const t = useTranslations();
  const stageName = useStageName();
  const notify = useNotifyError("preparation", "preparation");
  const notifyReview = useNotifyError("answer-review", "review");

  const { data: vacancy } = useVacancy(id);
  const {
    data: workflow,
    isPending: isWorkflowPending,
    error: workflowError,
  } = useVacancyWorkflow(id);

  const stage = workflow?.stages.find((item) => item.id === stageId);
  const workflowId = workflow?.id ?? "";

  const {
    data: preparation,
    isPending: isPreparationPending,
    error,
  } = usePreparation(workflowId, stageId);
  const answer = useAnswerPreparationQuestion(workflowId, stageId);
  const review = useReviewPreparationAnswer(workflowId, stageId);
  const notes = useStageNotes({
    vacancyId: id,
    workflowId: workflow?.id,
    stageId,
  });

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);

  const cards = preparation ? preparationCards(preparation.data, t) : [];
  const card = cards[index];
  const saved = card?.kind === "question" ? (card.item.userAnswer ?? "") : "";
  const isDirty = draft !== null && draft.trim() !== saved;

  const reviewAnswer = () => {
    if (card?.kind !== "question") return;

    review.mutate(
      { questionId: card.item.id, userAnswer: (draft ?? saved).trim() },
      {
        onSuccess: () => setDraft(null),
        onError: notifyReview,
      },
    );
  };

  const go = (offset: number) => {
    if (card?.kind === "question" && isDirty)
      answer.mutate(
        { questionId: card.item.id, userAnswer: draft.trim() },
        { onError: notify },
      );

    setDraft(null);
    setIndex((current) =>
      Math.min(Math.max(current + offset, 0), cards.length - 1),
    );
  };

  const isPending =
    isWorkflowPending || (Boolean(workflow) && isPreparationPending);
  const position = questionPosition(cards, index);
  const preparationError =
    error instanceof ApiError && error.status === 404 ? null : error;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <Link
        href={vacancyRoute(id)}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {stage ? stageName(stage.name) : t("preparation.page.back")}
        {vacancy?.company ? ` · ${vacancy.company}` : ""}
      </Link>

      <FormError error={workflowError ?? preparationError} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="grid gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          {isPending ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : card ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <PreparationProgress cards={cards} index={index} />
                <span className="shrink-0 font-mono text-[11px] text-subtle">
                  {card.kind === "question"
                    ? t("preparation.page.questionOf", position)
                    : t("preparation.page.cardOf", {
                        number: index + 1,
                        total: cards.length,
                      })}
                </span>
              </div>

              <PreparationCardView
                key={index}
                card={card}
                answer={draft ?? saved}
                onAnswerChange={setDraft}
                review={{
                  pending: review.isPending,
                  stale: isDirty,
                  onReview: reviewAnswer,
                }}
              />

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="secondary"
                  disabled={index === 0 || review.isPending}
                  onClick={() => go(-1)}
                >
                  <ArrowLeft />
                  {t("preparation.page.previous")}
                </Button>

                <span className="text-xs text-subtle">
                  {t("preparation.page.autosave")}
                </span>

                <Button
                  disabled={index === cards.length - 1 || review.isPending}
                  onClick={() => go(1)}
                >
                  {t("preparation.page.next")}
                  <ArrowRight />
                </Button>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("preparation.page.missing")}
            </p>
          )}
        </section>

        {workflow && stage && (
          <StageNotes
            notes={stage.notes}
            pending={notes.pending}
            onAdd={notes.add}
            onRemove={notes.remove}
          />
        )}
      </div>
    </div>
  );
}
