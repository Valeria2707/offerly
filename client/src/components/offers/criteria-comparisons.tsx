"use client";

import { useTranslations } from "next-intl";

import { COMPARISON_PAIRS, SAATY_SCALE } from "@/lib/offers";
import { cn } from "@/lib/utils";
import type { CriteriaComparisons as Comparisons } from "@/types/offer";

const STRENGTHS = ["0", "1", "2", "3", "4"] as const;

const strength = (index: number) => STRENGTHS[Math.abs(index - 4)];

export function useComparisonText() {
  const t = useTranslations("offers");

  return (key: keyof Comparisons, value: number): string => {
    const pair = COMPARISON_PAIRS.find((item) => item.key === key)!;
    const selected = SAATY_SCALE.findIndex(
      (item) => Math.abs(item - value) < 1e-9,
    );
    if (selected === 4) return t("equal");
    return t("moreImportant", {
      criterion: t(`criteria.${selected < 4 ? pair.left : pair.right}`),
      strength: t(`strength.${strength(selected)}`),
    });
  };
}

export function usePairText() {
  const t = useTranslations("offers");

  return (key: keyof Comparisons, value: number): string => {
    const pair = COMPARISON_PAIRS.find((item) => item.key === key)!;
    const selected = SAATY_SCALE.findIndex(
      (item) => Math.abs(item - value) < 1e-9,
    );
    const left = t(`criteria.${pair.left}`);
    const right = t(`criteria.${pair.right}`);
    if (selected === 4) return t("pairEqual", { left, right });
    return t("pairText", {
      winner: selected < 4 ? left : right,
      loser: selected < 4 ? right : left,
      strength: t(`strength.${strength(selected)}`),
    });
  };
}

export function CriteriaComparisons({
  value,
  disabled,
  onChange,
}: {
  value: Comparisons;
  disabled: boolean;
  onChange: (value: Comparisons) => void;
}) {
  const t = useTranslations("offers");
  const describe = useComparisonText();

  return (
    <div className="grid gap-5">
      {COMPARISON_PAIRS.map(({ key, left, right }) => {
        const selected = SAATY_SCALE.findIndex(
          (item) => Math.abs(item - value[key]) < 1e-9,
        );

        return (
          <div key={key} className="grid gap-2">
            <div className="grid grid-cols-[8rem_1fr_8rem] items-center gap-3 text-sm">
              <span className="text-right font-medium">
                {t(`criteria.${left}`)}
              </span>
              <div
                role="radiogroup"
                aria-label={`${t(`criteria.${left}`)} — ${t(`criteria.${right}`)}`}
                className="flex items-center justify-between"
              >
                {SAATY_SCALE.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    role="radio"
                    aria-checked={index === selected}
                    aria-label={t(`strength.${strength(index)}`)}
                    disabled={disabled}
                    className={cn(
                      "rounded-full border-2 border-border transition-colors hover:border-primary",
                      index === 4 ? "size-3.5" : "size-3",
                      index === selected && "border-primary bg-primary",
                    )}
                    onClick={() => onChange({ ...value, [key]: item })}
                  />
                ))}
              </div>
              <span className="font-medium">{t(`criteria.${right}`)}</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {describe(key, value[key])}
            </p>
          </div>
        );
      })}
    </div>
  );
}
