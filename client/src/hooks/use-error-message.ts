"use client";

import { useTranslations } from "next-intl";

import {
  HTTP_ERROR_STATUSES,
  PREPARATION_ERROR_STATUSES,
  REVIEW_ERROR_STATUSES,
} from "@/constants/api";
import { ApiError } from "@/lib/api-client";

type HttpStatus = (typeof HTTP_ERROR_STATUSES)[number];
type PreparationStatus = (typeof PREPARATION_ERROR_STATUSES)[number];
type ReviewStatus = (typeof REVIEW_ERROR_STATUSES)[number];

const isHttpStatus = (status: number): status is HttpStatus =>
  HTTP_ERROR_STATUSES.some((item) => item === status);

const isPreparationStatus = (status: number): status is PreparationStatus =>
  PREPARATION_ERROR_STATUSES.some((item) => item === status);

const isReviewStatus = (status: number): status is ReviewStatus =>
  REVIEW_ERROR_STATUSES.some((item) => item === status);

export function useErrorMessage() {
  const t = useTranslations("errors");

  return (
    cause: unknown,
    scope: "http" | "preparation" | "review" = "http",
  ): string => {
    const status = cause instanceof ApiError ? cause.status : 0;

    if (scope === "preparation" && isPreparationStatus(status))
      return t(`preparation.${status}`);
    if (scope === "review" && isReviewStatus(status))
      return t(`review.${status}`);
    if (isHttpStatus(status)) return t(`http.${status}`);

    return t("default");
  };
}
