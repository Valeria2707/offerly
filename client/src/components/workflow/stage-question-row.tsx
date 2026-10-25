"use client";

import { Flame, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { IconButton } from "@/components/core/icon-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ANSWER_MAX_LENGTH } from "@/constants/workflow";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";
import type { StageQuestion, StageQuestionDraft } from "@/types/workflow";

type StageQuestionRowProps = {
  item: StageQuestion;
  pending: boolean;
  onUpdate: (questionId: string, draft: StageQuestionDraft) => void;
  onRemove: (questionId: string) => void;
};

export function StageQuestionRow({
  item,
  pending,
  onUpdate,
  onRemove,
}: StageQuestionRowProps) {
  const t = useTranslations("workflow.questions");
  const tc = useTranslations("common.actions");
  const saved = item.answer ?? "";
  const [answer, setAnswer] = useState(saved);

  const isDirty = answer.trim() !== saved.trim();

  return (
    <li className="grid gap-2 rounded-xl bg-muted p-4">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium">{item.question}</p>

        <IconButton
          label={
            item.wasHard
              ? t("unmarkHard")
              : t("markHard")
          }
          disabled={pending}
          onClick={() =>
            onUpdate(item.id, {
              question: item.question,
              answer: item.answer,
              wasHard: !item.wasHard,
            })
          }
          className={cn(item.wasHard && "text-warning hover:text-warning")}
        >
          <Flame className="size-3.5" />
        </IconButton>

        <IconButton
          label={t("remove")}
          disabled={pending}
          onClick={() => onRemove(item.id)}
          className="hover:text-destructive"
        >
          <X className="size-3.5" />
        </IconButton>
      </div>

      <Textarea
        rows={2}
        value={answer}
        maxLength={ANSWER_MAX_LENGTH}
        aria-label={t("answerLabel", { question: item.question })}
        placeholder={t("answerPlaceholder")}
        className={cn(
          "field-sizing-fixed max-h-40 resize-none overflow-y-auto bg-card py-2.5",
          FIELD_CLASS,
        )}
        onChange={(event) => setAnswer(event.target.value)}
      />

      {isDirty && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              onUpdate(item.id, {
                question: item.question,
                answer: answer.trim(),
                wasHard: item.wasHard,
              })
            }
          >
            {tc("save")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => setAnswer(saved)}
          >
            {tc("cancel")}
          </Button>
        </div>
      )}
    </li>
  );
}
