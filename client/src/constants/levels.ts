export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const LANGUAGE_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Native",
] as const;

const TRANSLATED_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "Native",
] as const;

export type TranslatedLevel = (typeof TRANSLATED_LEVELS)[number];

export const isTranslatedLevel = (level: string): level is TranslatedLevel =>
  TRANSLATED_LEVELS.some((item) => item === level);
