import {
  AXIS_STEPS,
  DAY_MS,
  DAYS_IN_WEEK,
  MIN_BAR_PERCENT,
} from "@/constants/analytics";
import { STAGE_CATEGORY_LABELS } from "@/constants/workflow";
import { pluralizeDays } from "@/lib/utils";
import type {
  AnalyticsSummary,
  CategoryResult,
  FunnelStepCount,
} from "@/types/analytics";

const WEEK_FORMAT = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const RANGE_FORMAT = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function weekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start.getTime() + (DAYS_IN_WEEK - 1) * DAY_MS);
  return RANGE_FORMAT.formatRange(start, end);
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

export function weekLabel(weekStart: string): string {
  return WEEK_FORMAT.format(new Date(weekStart));
}

export function formatDays(days: number | null): string {
  return days === null ? "—" : `${days} ${pluralizeDays(days)}`;
}

export function addedHint(
  summary: AnalyticsSummary,
  period: number | null,
): string | null {
  if (summary.addedPrevious === null || !period) return null;
  const previous = `за попередні ${period} ${pluralizeDays(period)}`;
  const diff = summary.added - summary.addedPrevious;
  if (diff === 0) return `стільки ж, скільки ${previous}`;
  return `на ${Math.abs(diff)} ${diff > 0 ? "більше" : "менше"}, ніж ${previous}`;
}

export function funnelTotal(funnel: FunnelStepCount[]): number {
  return funnel.find((item) => item.step === "added")?.count ?? 0;
}

export function weakestCategory(categories: CategoryResult[]): string | null {
  const rated = categories.filter(
    (item) => item.rate !== null && item.failed > 0,
  );
  if (!rated.length) return null;

  const weakest = rated.reduce((min, item) =>
    (item.rate ?? 0) < (min.rate ?? 0) ? item : min,
  );

  return STAGE_CATEGORY_LABELS[weakest.category];
}
