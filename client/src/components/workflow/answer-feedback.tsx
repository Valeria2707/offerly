"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { BulletList } from "@/components/core/bullet-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnswerFeedback as Feedback } from "@/types/preparation";

const SCORE_CLASS: Record<number, string> = {
  1: "bg-rejected-muted text-rejected",
  2: "bg-rejected-muted text-rejected",
  3: "bg-warning-muted text-warning",
  4: "bg-success-muted text-success",
  5: "bg-success-muted text-success",
};

export function AnswerFeedback({
  feedback,
  stale,
}: {
  feedback: Feedback;
  stale: boolean;
}) {
  const t = useTranslations("preparation.review");
  const [showImproved, setShowImproved] = useState(false);
  const score = String(feedback.score) as "1" | "2" | "3" | "4" | "5";

  return (
    <section
      aria-label={t("title")}
      className={cn(
        "grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-opacity",
        stale && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-ai-muted font-mono text-[10px] tracking-wider text-ai">
          AI
        </span>
        <h3 className="font-heading text-sm font-bold tracking-tight">
          {t("title")}
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            SCORE_CLASS[feedback.score] ?? "bg-secondary",
          )}
        >
          {t("score", { score: feedback.score })} · {t(`scores.${score}`)}
        </span>
      </div>

      {stale && <p className="text-xs text-warning">{t("stale")}</p>}

      <p className="text-sm">{feedback.verdict}</p>

      {feedback.strengths.length > 0 && (
        <div className="grid gap-2">
          <h4 className="text-xs font-medium text-subtle">{t("strengths")}</h4>
          <BulletList items={feedback.strengths} />
        </div>
      )}

      {feedback.improvements.length > 0 && (
        <div className="grid gap-2">
          <h4 className="text-xs font-medium text-subtle">
            {t("improvements")}
          </h4>
          <BulletList items={feedback.improvements} />
        </div>
      )}

      {showImproved ? (
        <div className="grid gap-2">
          <h4 className="text-xs font-medium text-subtle">
            {t("improvedTitle")}
          </h4>
          <p className="border-l-2 border-border pl-3 text-sm whitespace-pre-wrap text-muted-foreground">
            {feedback.improvedAnswer}
          </p>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() => setShowImproved(true)}
        >
          {t("improvedAnswer")}
        </Button>
      )}
    </section>
  );
}
