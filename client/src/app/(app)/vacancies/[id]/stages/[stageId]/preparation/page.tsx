"use client";

import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { Skeleton } from "@/components/core/skeleton";
import { Button } from "@/components/ui/button";
import { PreparationCardView } from "@/components/workflow/preparation-card-view";
import { PreparationProgress } from "@/components/workflow/preparation-progress";
import { StageNotes } from "@/components/workflow/stage-notes";
import { DEFAULT_API_ERROR_MESSAGE } from "@/constants/api";
import { PREPARATION_ERROR_MESSAGES } from "@/constants/preparation";
import { vacancyRoute } from "@/constants/routes";
import {
  useAnswerPreparationQuestion,
  usePreparation,
} from "@/hooks/use-preparation";
import { useVacancy } from "@/hooks/use-vacancies";
import {
  useAddStageNote,
  useRemoveStageNote,
  useVacancyWorkflow,
} from "@/hooks/use-workflow";
import { ApiError } from "@/lib/api-client";
import { preparationCards } from "@/lib/preparation-cards";
import { stageName } from "@/lib/workflow";

export default function StagePreparationPage({
  params,
}: {
  params: Promise<{ id: string; stageId: string }>;
}) {
  const { id, stageId } = use(params);

  const { data: vacancy } = useVacancy(id);
  const { data: workflow, isPending: isWorkflowPending } =
    useVacancyWorkflow(id);

  const stage = workflow?.stages.find((item) => item.id === stageId);
  const workflowId = workflow?.id ?? "";

  const {
    data: preparation,
    isPending: isPreparationPending,
    error,
  } = usePreparation(workflowId, stageId);
  const answer = useAnswerPreparationQuestion(workflowId, stageId);
  const addNote = useAddStageNote(id);
  const removeNote = useRemoveStageNote(id);

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);

  const notify = (cause: unknown) =>
    toast.error(
      cause instanceof ApiError
        ? (PREPARATION_ERROR_MESSAGES[cause.status] ?? cause.message)
        : DEFAULT_API_ERROR_MESSAGE,
      { id: "preparation-error" },
    );

  const cards = preparation ? preparationCards(preparation.data) : [];
  const card = cards[index];
  const saved = card?.kind === "question" ? (card.item.userAnswer ?? "") : "";

  const go = (offset: number) => {
    if (card?.kind === "question" && draft !== null && draft.trim() !== saved)
      answer.mutate(
        { questionId: card.item.id, userAnswer: draft.trim() },
        { onError: notify },
      );

    setDraft(null);
    setIndex((current) =>
      Math.min(Math.max(current + offset, 0), cards.length - 1),
    );
  };

  const isPending = isWorkflowPending || isPreparationPending;
  const questionNumber =
    card?.kind === "question"
      ? cards.filter(
          (item, position) => item.kind === "question" && position <= index,
        ).length
      : 0;
  const questionTotal = cards.filter((item) => item.kind === "question").length;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <Link
        href={vacancyRoute(id)}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {stage ? stageName(stage.name) : "Етапи заявки"}
        {vacancy?.company ? ` · ${vacancy.company}` : ""}
      </Link>

      <FormError error={error} />

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
                    ? `питання ${questionNumber} з ${questionTotal}`
                    : `картка ${index + 1} з ${cards.length}`}
                </span>
              </div>

              <PreparationCardView
                key={index}
                card={card}
                answer={draft ?? saved}
                onAnswerChange={setDraft}
              />

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="secondary"
                  disabled={index === 0}
                  onClick={() => go(-1)}
                >
                  <ArrowLeft />
                  Назад
                </Button>

                <span className="text-xs text-subtle">
                  відповідь зберігається при переході
                </span>

                <Button
                  disabled={index === cards.length - 1}
                  onClick={() => go(1)}
                >
                  Далі
                  <ArrowRight />
                </Button>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Підготовки для цього етапу ще немає — згенеруйте її на сторінці
              заявки.
            </p>
          )}
        </section>

        {workflow && stage && (
          <StageNotes
            notes={stage.notes}
            pending={addNote.isPending || removeNote.isPending}
            onAdd={(content) =>
              addNote.mutate(
                { workflowId: workflow.id, stageId, content },
                { onError: notify },
              )
            }
            onRemove={(noteId) =>
              removeNote.mutate(
                { workflowId: workflow.id, stageId, noteId },
                { onError: notify },
              )
            }
          />
        )}
      </div>
    </div>
  );
}
