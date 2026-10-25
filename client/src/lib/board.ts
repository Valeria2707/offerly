import { format } from "date-fns";

import {
  BOARD_COLUMNS,
  CATEGORY_COLUMNS,
  OFFER_STAGE_CODES,
  type BoardColumn,
} from "@/constants/board";
import type { Locale } from "@/constants/i18n";
import { CLOSED_STAGE_STATUSES } from "@/constants/workflow";
import { dateFnsLocale } from "@/lib/date-locale";
import type { Translator } from "@/lib/i18n";
import { formatDaysAgo } from "@/lib/utils";
import type { Vacancy } from "@/types/vacancy";
import type {
  StageCategory,
  StageStatus,
  WorkflowStage,
  WorkflowSummary,
} from "@/types/workflow";

export class MissingBoardStageError extends Error {}

export type BoardNote = {
  icon: "calendar" | "clock" | "bell" | "hourglass" | "send" | "offer" | "x";
  tone: "muted" | "warning" | "success";
  text: string;
};

export type StagePlanStep = { stageId: string; status: StageStatus };

export function stageColumn(
  code: string | null,
  category: StageCategory,
): BoardColumn {
  if (code && OFFER_STAGE_CODES.includes(code)) return "offer";
  return CATEGORY_COLUMNS[category];
}

export function boardColumn(summary: WorkflowSummary | undefined): BoardColumn {
  if (summary?.rejected) return "rejected";
  if (summary?.offered) return "offer";

  const stage = summary?.reachedStage;
  if (!stage) return "submitted";
  return stageColumn(stage.code, stage.category);
}

export function canMove(from: BoardColumn, to: BoardColumn): boolean {
  if (from === "rejected" || from === to) return false;
  if (to === "rejected") return true;
  return BOARD_COLUMNS.indexOf(to) > BOARD_COLUMNS.indexOf(from);
}

const isClosed = (stage: WorkflowStage) =>
  CLOSED_STAGE_STATUSES.includes(stage.status);

export function planMove(
  stages: WorkflowStage[],
  codes: Map<string, string | null>,
  target: BoardColumn,
): StagePlanStep[] {
  if (target === "rejected") {
    const open =
      stages.find(
        (stage) => !isClosed(stage) && stage.status !== "not_started",
      ) ?? stages.find((stage) => !isClosed(stage));
    if (!open) throw new MissingBoardStageError();
    return [{ stageId: open.id, status: "cancelled" }];
  }

  const targetIndex = stages.findIndex(
    (stage) =>
      !isClosed(stage) &&
      stageColumn(codes.get(stage.stageTypeId) ?? null, stage.category) ===
        target,
  );
  if (targetIndex === -1) throw new MissingBoardStageError();

  const plan: StagePlanStep[] = stages
    .slice(0, targetIndex)
    .filter((stage) => !isClosed(stage))
    .map((stage) => ({
      stageId: stage.id,
      status: stage.status === "not_started" ? "skipped" : "completed",
    }));

  const targetStage = stages[targetIndex];
  if (targetStage.status === "not_started")
    plan.push({ stageId: targetStage.id, status: "in_progress" });

  return plan;
}

export function boardNote(
  vacancy: Vacancy,
  summary: WorkflowSummary | undefined,
  column: BoardColumn,
  silentDays: number | null,
  t: Translator,
  locale: Locale,
): BoardNote | null {
  const options = { locale: dateFnsLocale(locale) };
  const reached = summary?.reachedStage;
  const current = summary?.currentStage;

  if (column === "rejected") {
    if (!reached?.completedAt) return null;
    return {
      icon: "x",
      tone: "muted",
      text: format(new Date(reached.completedAt), "d MMM", options),
    };
  }
  if (silentDays !== null)
    return {
      icon: "bell",
      tone: "warning",
      text: t("vacancies.board.silent", { days: silentDays }),
    };
  if (current?.scheduledAt)
    return {
      icon: "calendar",
      tone: column === "offer" ? "success" : "muted",
      text: format(new Date(current.scheduledAt), "EEEEEE, HH:mm", options),
    };
  if (current?.deadlineAt)
    return {
      icon: column === "offer" ? "offer" : "clock",
      tone: column === "offer" ? "success" : "warning",
      text: t("vacancies.board.deadline", {
        date: format(new Date(current.deadlineAt), "d MMM", options),
      }),
    };
  if (current?.status === "awaiting_result")
    return {
      icon: "hourglass",
      tone: "muted",
      text: t("vacancies.board.awaiting"),
    };
  if (column === "submitted")
    return {
      icon: "send",
      tone: "muted",
      text: formatDaysAgo(vacancy.createdAt, locale),
    };

  return null;
}
