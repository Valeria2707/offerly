"use client";

import { useState } from "react";

import { BulletList } from "@/components/core/bullet-list";
import { TermList } from "@/components/core/term-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { USER_ANSWER_MAX_LENGTH } from "@/constants/preparation";
import type { PreparationCard } from "@/lib/preparation-cards";
import { cn } from "@/lib/utils";
import { FIELD_CLASS } from "@/styles/field-styles";

type PreparationCardViewProps = {
  card: PreparationCard;
  answer: string;
  onAnswerChange: (answer: string) => void;
};

export function PreparationCardView({
  card,
  answer,
  onAnswerChange,
}: PreparationCardViewProps) {
  return (
    <article className="grid gap-4 rounded-xl bg-muted p-6">
      <span className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">
        {card.caption}
      </span>

      {card.kind === "question" ? (
        <QuestionCard
          card={card}
          answer={answer}
          onAnswerChange={onAnswerChange}
        />
      ) : (
        <>
          <h2 className="font-heading text-lg font-bold tracking-tight">
            {card.title}
          </h2>

          {card.kind === "text" && (
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {card.body}
            </p>
          )}

          {card.kind === "terms" && <TermList terms={card.terms} />}

          {card.kind === "list" && <BulletList items={card.items} />}

          {card.kind === "task" && (
            <>
              <p className="text-sm whitespace-pre-wrap">{card.body}</p>
              {card.hint && <Reveal label="Показати підказку" text={card.hint} />}
            </>
          )}
        </>
      )}
    </article>
  );
}

function QuestionCard({
  card,
  answer,
  onAnswerChange,
}: {
  card: Extract<PreparationCard, { kind: "question" }>;
  answer: string;
  onAnswerChange: (answer: string) => void;
}) {
  return (
    <>
      <h2 className="font-heading text-lg font-bold tracking-tight">
        {card.item.question}
      </h2>

      <Textarea
        rows={4}
        value={answer}
        maxLength={USER_ANSWER_MAX_LENGTH}
        aria-label="Ваша відповідь"
        placeholder="Ваша відповідь…"
        className={cn(
          "field-sizing-fixed max-h-64 resize-none overflow-y-auto bg-card py-2.5",
          FIELD_CLASS,
        )}
        onChange={(event) => onAnswerChange(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {card.item.tips && (
          <Reveal label="Показати підказку" text={card.item.tips} />
        )}
        {card.item.expectedAnswer && (
          <Reveal label="Очікувана відповідь" text={card.item.expectedAnswer} />
        )}
      </div>
    </>
  );
}

function Reveal({ label, text }: { label: string; text: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen)
    return (
      <p className="w-full border-l-2 border-border pl-3 text-sm whitespace-pre-wrap text-muted-foreground">
        {text}
      </p>
    );

  return (
    <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
      {label}
    </Button>
  );
}
