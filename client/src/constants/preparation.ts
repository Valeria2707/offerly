import type { PreparationType } from "@/types/preparation";

export const PREPARATION_HIGHLIGHTS = {
  CV_COVER_LETTER: ["cvTips", "coverLetter", "keywords"],
  HR_SCREENING: ["pitch", "expectedQuestions", "askBack"],
  TECHNICAL: ["stack", "theory", "practice"],
  CUSTOM: ["stageDescription", "prepQuestions"],
} as const satisfies Record<PreparationType, readonly string[]>;

export const CV_STAGE_CODE = "submitted";
export const TECHNICAL_SCREENING_CODES = ["pre_tech_screening"];
export const NO_PREPARATION_STAGE_CODES = ["rejection"];

export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const USER_ANSWER_MAX_LENGTH = 10_000;
