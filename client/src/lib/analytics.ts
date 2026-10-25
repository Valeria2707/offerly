import {
  AXIS_STEPS,
  DAY_MS,
  DAYS_IN_WEEK,
  MIN_BAR_PERCENT,
} from "@/constants/analytics";
import type { Locale } from "@/constants/i18n";
import type { Translator } from "@/lib/i18n";
import type {
  AnalyticsSummary,
  CategoryResult,
  FunnelStepCount,
} from "@/types/analytics";
import type { StageCategory } from "@/types/workflow";

export function weekRange(weekStart: string, locale: Locale): string {
  const start = new Date(weekStart);
  const end = new Date(start.getTime() + (DAYS_IN_WEEK - 1) * DAY_MS);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).formatRange(start, end);
}

export function axisTicks(max: number): number[] {
  const step = Math.max(1, Math.ceil(max / AXIS_STEPS));
  const count = Math.max(1, Math.ceil(max / step));
  return Array.from({ length: count + 1 }, (_, index) => index * step);
}

export function barPercent(value: number, max: number): number {
  if (!max || !value) return 0;
  return Math.max(MIN_BAR_PERCENT, Math.round((value / max) * 100));
}

export function sharePercent(value: number, total: number): number | null {
  return total ? Math.round((value / total) * 100) : null;
}

export function weekLabel(weekStart: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(weekStart));
}

export function formatDays(days: number | null, t: Translator): string {
  return days === null ? "—" : t("analytics.days", { count: days });
}

export function addedHint(
  summary: AnalyticsSummary,
  period: number | null,
  t: Translator,
): string | null {
  if (summary.addedPrevious === null || !period) return null;

  const diff = summary.added - summary.addedPrevious;
  if (diff === 0) return t("analytics.summary.same", { period });
  if (diff > 0) return t("analytics.summary.more", { diff, period });
  return t("analytics.summary.less", { diff: Math.abs(diff), period });
}

export function funnelTotal(funnel: FunnelStepCount[]): number {
  return funnel.find((item) => item.step === "added")?.count ?? 0;
}

export function weakestCategory(
  categories: CategoryResult[],
): StageCategory | null {
  const rated = categories.filter(
    (item) => item.rate !== null && item.failed > 0,
  );
  if (!rated.length) return null;

  const weakest = rated.reduce((min, item) =>
    (item.rate ?? 0) < (min.rate ?? 0) ? item : min,
  );

  return weakest.category;
}
