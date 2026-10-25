"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { CheckboxRow } from "@/components/core/checkbox-row";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StageQuestionRow } from "@/components/workflow/stage-question-row";
import { QUESTION_MAX_LENGTH } from "@/constants/workflow";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";
import type { StageQuestion, StageQuestionDraft } from "@/types/workflow";

type StageQuestionsProps = {
  questions: StageQuestion[];
  pending: boolean;
  onAdd: (draft: StageQuestionDraft) => void;
  onUpdate: (questionId: string, draft: StageQuestionDraft) => void;
  onRemove: (questionId: string) => void;
};

export function StageQuestions({
  questions,
  pending,
  onAdd,
  onUpdate,
  onRemove,
}: StageQuestionsProps) {
  const t = useTranslations("workflow.questions");
  const tc = useTranslations("common.actions");
  const [draft, setDraft] = useState("");
  const [wasHard, setWasHard] = useState(false);

  const reset = () => {
    setDraft("");
    setWasHard(false);
  };

  const submit = () => {
    const question = draft.trim();
    if (!question) return;

    onAdd({ question, wasHard });
    reset();
  };

  return (
    <section className="grid gap-4 rounded-xl bg-card px-6 py-5 ring-1 ring-foreground/10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold tracking-tight">
          {t("title")}
        </h2>
        <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">
          {questions.length > 0
            ? t("saved", { count: questions.length })
            : t("empty")}
        </span>
      </header>

      {questions.length > 0 && (
        <ul className="-mr-1 grid max-h-96 gap-2 overflow-y-auto pr-1">
          {questions.map((item) => (
            <StageQuestionRow
              key={item.id}
              item={item}
              pending={pending}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}

      <div className="grid gap-3">
        <Textarea
          rows={2}
          value={draft}
          maxLength={QUESTION_MAX_LENGTH}
          aria-label={t("new")}
          placeholder={t("placeholder")}
          className={cn(
            "field-sizing-fixed max-h-32 resize-none overflow-y-auto py-2.5",
            FIELD_CLASS,
          )}
          onChange={(event) => setDraft(event.target.value)}
        />

        {draft.trim() && (
          <>
            <CheckboxRow
              id="question-was-hard"
              label={t("wasHard")}
              checked={wasHard}
              onChange={setWasHard}
            />

            <div className="flex gap-2">
              <Button size="sm" disabled={pending} onClick={submit}>
                <Plus />
                {tc("add")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={reset}
              >
                {tc("cancel")}
              </Button>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-subtle">
        {t("hint")}
      </p>
    </section>
  );
}
