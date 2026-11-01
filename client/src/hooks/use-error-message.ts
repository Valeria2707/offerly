"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { AI_ERROR_STATUSES, HTTP_ERROR_STATUSES } from "@/constants/api";
import { ApiError } from "@/lib/api-client";

type HttpStatus = (typeof HTTP_ERROR_STATUSES)[number];
type AiStatus = (typeof AI_ERROR_STATUSES)[number];
type ErrorScope = "http" | "preparation" | "review";

const isHttpStatus = (status: number): status is HttpStatus =>
  HTTP_ERROR_STATUSES.some((item) => item === status);

const isAiStatus = (status: number): status is AiStatus =>
  AI_ERROR_STATUSES.some((item) => item === status);

export function useErrorMessage() {
  const t = useTranslations("errors");

  return (cause: unknown, scope: ErrorScope = "http"): string => {
    const status = cause instanceof ApiError ? cause.status : 0;

    if (scope !== "http" && isAiStatus(status)) return t(`${scope}.${status}`);
    if (isHttpStatus(status)) return t(`http.${status}`);

    return t("default");
  };
}

export function useNotifyError(id: string, scope: ErrorScope = "http") {
  const errorMessage = useErrorMessage();

  return (cause: unknown) =>
    toast.error(errorMessage(cause, scope), { id: `${id}-error` });
}
