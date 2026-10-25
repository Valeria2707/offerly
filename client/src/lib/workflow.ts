import type { useTranslations } from "next-intl";

import type { Locale } from "@/constants/i18n";
import {
  CLOSED_STAGE_STATUSES,
  SYSTEM_STAGE_KEYS,
  type SystemStageName,
} from "@/constants/workflow";
import type { StageType, WorkflowStage } from "@/types/workflow";

type StageTypeMetaT = ReturnType<typeof useTranslations<"stageTypes.meta">>;

export type StageNameFormatter = (name: string) => string;

export function isSystemStageName(name: string): name is SystemStageName {
  return name in SYSTEM_STAGE_KEYS;
}

export function isSystemStageType(type: StageType): boolean {
  return type.ownerUserId === null;
}

export function formatStageDate(
  iso: string | null,
  locale: Locale,
): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  const day = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return time === "00:00" ? day : `${day} · ${time}`;
}

export function toDateTimeInput(iso: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toDateInput(iso: string | null): string {
  return toDateTimeInput(iso).slice(0, 10);
}

export function fromDateInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function stageTypeMeta(type: StageType, t: StageTypeMetaT): string {
  return [
    type.expectedDurationMinutes
      ? t("duration", { minutes: type.expectedDurationMinutes })
      : null,
    type.requiresPreparation ? t("preparation") : t("noPreparation"),
    type.supportsDeadline ? t("deadline") : null,
    type.producesArtifact ? t("artifact") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function movedStageIds(
  stages: WorkflowStage[],
  from: number,
  to: number,
): string[] {
  const ids = stages.map((stage) => stage.id);
  const [moved] = ids.splice(from, 1);
  ids.splice(to, 0, moved);
  return ids;
}

export function currentStageIndex(stages: WorkflowStage[]): number {
  return stages.findIndex(
    (stage) => !CLOSED_STAGE_STATUSES.includes(stage.status),
  );
}
