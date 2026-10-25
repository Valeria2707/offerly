import type { StageCategory } from "@/types/workflow";

/** Колонки дошки — за категорією етапу, а не за його назвою. */
export const BOARD_COLUMNS = [
  "submitted",
  "screening",
  "technical",
  "final",
  "offer",
  "rejected",
] as const;

export type BoardColumn = (typeof BOARD_COLUMNS)[number];

export const CATEGORY_COLUMNS: Record<StageCategory, BoardColumn> = {
  administrative: "submitted",
  screening: "screening",
  technical: "technical",
  behavioral: "final",
};

export const OFFER_STAGE_CODES = ["offer", "offer_negotiation"];

export const BOARD_STRIPE_CLASSES: Record<BoardColumn, string> = {
  submitted: "border-t-subtle/40",
  screening: "border-t-subtle",
  technical: "border-t-primary",
  final: "border-t-ai",
  offer: "border-t-success",
  rejected: "border-t-rejected/40",
};

export const BOARD_HEADER_CLASSES: Partial<Record<BoardColumn, string>> = {
  offer: "text-success",
  rejected: "text-rejected",
};

export const VACANCY_VIEWS = ["list", "board"] as const;

export type VacancyView = (typeof VACANCY_VIEWS)[number];

export const VACANCY_VIEW_STORAGE_KEY = "offerly.vacancy-view";
