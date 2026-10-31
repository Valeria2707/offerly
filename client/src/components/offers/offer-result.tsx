"use client";

import { AlertTriangle, Check, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  useComparisonText,
  usePairText,
} from "@/components/offers/criteria-comparisons";
import { COMPARISON_PAIRS, findContradiction, toPercent } from "@/lib/offers";
import { cn } from "@/lib/utils";
import type {
  ComparisonChange,
  CriteriaComparisons,
  OfferRecommendation,
} from "@/types/offer";
import type { Vacancy } from "@/types/vacancy";

type OfferResultProps = {
  result: OfferRecommendation;
  comparisons: CriteriaComparisons;
  offers: Vacancy[];
  onApplySuggestions: (changes: ComparisonChange[]) => void;
};

export function OfferResult({
  result,
  comparisons,
  offers,
  onApplySuggestions,
}: OfferResultProps) {
  const t = useTranslations("offers");
  const describe = useComparisonText();
  const byId = new Map(offers.map((offer) => [offer.id, offer]));
  const best = byId.get(result.recommendedVacancyId);
  const { consistent } = result.consistency;
  const { suggestions } = result;
  const pairText = usePairText();
  const contradiction = consistent ? null : findContradiction(comparisons);
  const others = contradiction
    ? COMPARISON_PAIRS.filter((pair) => pair.key !== contradiction.key)
    : [];

  return (
    <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-success-muted text-success">
          <Trophy className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{t("recommended")}</p>
          <h2 className="font-heading text-lg font-bold tracking-tight">
            {best?.company} · {best?.title}
          </h2>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold">{t("matchTitle")}</h3>

        <ol className="grid gap-2">
          {result.ranking.map((item, index) => (
            <li
              key={item.vacancyId}
              className="grid grid-cols-[1.5rem_10rem_1fr_3rem] items-center gap-3 text-sm"
            >
              <span className="font-mono text-xs text-subtle">{index + 1}</span>
              <span className="truncate font-medium">
                {byId.get(item.vacancyId)?.company}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-secondary">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    index === 0 ? "bg-primary" : "bg-subtle/50",
                  )}
                  style={{ width: `${item.weight * 100}%` }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">
                {toPercent(item.weight)}%
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p
        className={cn(
          "flex items-start gap-2 text-sm",
          consistent ? "text-success" : "text-warning",
        )}
      >
        {consistent ? (
          <Check className="mt-0.5 size-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        )}
        {consistent ? t("consistent") : t("inconsistent")}
      </p>

      {contradiction && (
        <p className="text-sm text-muted-foreground">
          {t("explanation", {
            first: pairText(others[0].key, comparisons[others[0].key]),
            second: pairText(others[1].key, comparisons[others[1].key]),
            implied: pairText(contradiction.key, contradiction.implied),
            actual: pairText(contradiction.key, comparisons[contradiction.key]),
          })}
        </p>
      )}

      {!consistent && suggestions.length > 0 && (
        <div className="grid gap-3 rounded-lg bg-warning-muted px-4 py-3 text-sm">
          <p>{t("suggestionIntro")}</p>
          <ul className="grid gap-2">
            {suggestions.map((changes, index) => (
              <li
                key={index}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <span>
                  {changes
                    .map((change) => {
                      const pair = COMPARISON_PAIRS.find(
                        (item) => item.key === change.comparison,
                      )!;
                      return t("suggestion", {
                        left: t(`criteria.${pair.left}`),
                        right: t(`criteria.${pair.right}`),
                        answer: describe(change.comparison, change.value),
                      });
                    })
                    .join("; ")}
                </span>
                <Button size="sm" onClick={() => onApplySuggestions(changes)}>
                  {t("applySuggestion")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
