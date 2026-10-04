import {
  CV_STAGE_CODE,
  NO_PREPARATION_STAGE_CODES,
  TECHNICAL_SCREENING_CODES,
} from "@/constants/preparation";
import type { PreparationType } from "@/types/preparation";
import type { StageType } from "@/types/workflow";

export function hasPreparation(stageType: StageType): boolean {
  return (
    stageType.requiresPreparation &&
    !NO_PREPARATION_STAGE_CODES.includes(stageType.code ?? "")
  );
}

export function resolvePreparationType(
  stageType: StageType,
): PreparationType | null {
  if (stageType.ownerUserId) return null;
  if (stageType.code === CV_STAGE_CODE) return "CV_COVER_LETTER";
  if (
    TECHNICAL_SCREENING_CODES.includes(stageType.code ?? "") ||
    stageType.category === "technical"
  )
    return "TECHNICAL";
  if (stageType.category === "screening" || stageType.category === "behavioral")
    return "HR_SCREENING";
  return "CUSTOM";
}
