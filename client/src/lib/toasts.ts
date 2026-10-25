import type { BoardColumn } from "@/constants/board";
import type { Translator } from "@/lib/i18n";
import type { VacancyPatch } from "@/types/vacancy";
import type { WorkflowStagePatch } from "@/types/workflow";

export function stageUpdateToast(
  patch: WorkflowStagePatch,
  t: Translator,
): string {
  if (patch.status === "completed") return t("toasts.stagePassed");
  if (patch.status === "cancelled") return t("toasts.stageRejected");
  if (patch.status)
    return t("toasts.stageStatus", {
      status: t(`workflow.status.${patch.status}`),
    });
  if (patch.rejectionReason !== undefined) return t("toasts.rejectionReason");
  if (patch.scheduledAt !== undefined)
    return patch.scheduledAt
      ? t("toasts.meetingSet")
      : t("toasts.meetingCleared");
  if (patch.deadlineAt !== undefined)
    return patch.deadlineAt
      ? t("toasts.deadlineSet")
      : t("toasts.deadlineCleared");
  if (patch.artifactUrl !== undefined) return t("toasts.artifactSaved");
  return t("toasts.stageUpdated");
}

export function vacancyUpdateToast(patch: VacancyPatch, t: Translator): string {
  if (patch.lifecycle === "archived") return t("toasts.vacancyArchived");
  if (patch.lifecycle === "active") return t("toasts.vacancyRestored");
  if ("recruiterName" in patch) return t("toasts.recruiterSaved");
  return t("toasts.vacancyUpdated");
}

export function boardMoveToast(target: BoardColumn, t: Translator): string {
  if (target === "rejected") return t("toasts.stageRejected");
  return t("toasts.movedTo", {
    column: t(`vacancies.board.columns.${target}`),
  });
}
