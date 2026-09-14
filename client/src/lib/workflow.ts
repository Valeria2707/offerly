import {
  CLOSED_STAGE_STATUSES,
  SYSTEM_STAGE_NAMES,
} from "@/constants/workflow";
import type { StageType, WorkflowStage } from "@/types/workflow";

export function stageName(name: string): string {
  return SYSTEM_STAGE_NAMES[name] ?? name;
}

export function isSystemStageType(type: StageType): boolean {
  return type.ownerUserId === null;
}

const DATE_FORMAT = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
});

const TIME_FORMAT = new Intl.DateTimeFormat("uk-UA", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatStageDate(iso: string | null): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  const time = TIME_FORMAT.format(date);

  return time === "00:00"
    ? DATE_FORMAT.format(date)
    : `${DATE_FORMAT.format(date)} · ${time}`;
}

export function formatDuration(minutes: number | null): string | null {
  return minutes ? `${minutes} хв` : null;
}

export function stageTypeMeta(type: StageType): string {
  return [
    formatDuration(type.expectedDurationMinutes),
    type.requiresPreparation ? "потребує підготовки" : "без підготовки",
    type.supportsDeadline ? "дедлайн" : null,
    type.producesArtifact ? "артефакт" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function swappedStageIds(
  stages: WorkflowStage[],
  index: number,
  offset: number,
): string[] {
  const ids = stages.map((stage) => stage.id);
  const target = index + offset;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}

export function currentStageIndex(stages: WorkflowStage[]): number {
  return stages.findIndex(
    (stage) => !CLOSED_STAGE_STATUSES.includes(stage.status),
  );
}
