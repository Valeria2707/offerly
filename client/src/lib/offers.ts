import { boardColumn } from "@/lib/board";
import type { CriteriaComparisons } from "@/types/offer";
import type { Vacancy } from "@/types/vacancy";
import type { WorkflowSummary } from "@/types/workflow";

export const SAATY_SCALE = [9, 7, 5, 3, 1, 1 / 3, 1 / 5, 1 / 7, 1 / 9];

export const COMPARISON_PAIRS = [
  { key: "salaryVsGrowth", left: "salary", right: "growth" },
  { key: "salaryVsConditions", left: "salary", right: "conditions" },
  { key: "growthVsConditions", left: "growth", right: "conditions" },
] as const satisfies {
  key: keyof CriteriaComparisons;
  left: string;
  right: string;
}[];

export const EQUAL_COMPARISONS: CriteriaComparisons = {
  salaryVsGrowth: 1,
  salaryVsConditions: 1,
  growthVsConditions: 1,
};

export function offerVacancies(
  vacancies: Vacancy[],
  summaries: Map<string, WorkflowSummary> | undefined,
): Vacancy[] {
  return vacancies.filter(
    (vacancy) =>
      vacancy.lifecycle !== "archived" &&
      boardColumn(summaries?.get(vacancy.id)) === "offer",
  );
}

export const toPercent = (value: number): number => Math.round(value * 100);

const snapToScale = (value: number): number =>
  SAATY_SCALE.reduce((best, item) =>
    Math.abs(Math.log(item) - Math.log(value)) <
    Math.abs(Math.log(best) - Math.log(value))
      ? item
      : best,
  );

export function findContradiction(c: CriteriaComparisons): {
  key: keyof CriteriaComparisons;
  implied: number;
} {
  const implied: CriteriaComparisons = {
    salaryVsGrowth: c.salaryVsConditions / c.growthVsConditions,
    salaryVsConditions: c.salaryVsGrowth * c.growthVsConditions,
    growthVsConditions: c.salaryVsConditions / c.salaryVsGrowth,
  };
  const gap = (key: keyof CriteriaComparisons) =>
    Math.abs(Math.log(c[key]) - Math.log(implied[key]));
  const key = COMPARISON_PAIRS.map((pair) => pair.key).reduce((worst, item) =>
    gap(item) > gap(worst) ? item : worst,
  );
  return { key, implied: snapToScale(implied[key]) };
}
