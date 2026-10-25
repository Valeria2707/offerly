"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  applyVacancyImportRequest,
  deleteVacancyRequest,
  importVacancyTextRequest,
  importVacancyUrlRequest,
  updateVacancyRequest,
  vacanciesRequest,
  vacancyImportRequest,
  vacancyRequest,
} from "@/api/vacancies";
import { vacancyUpdateToast } from "@/lib/toasts";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { VacancyDraft, VacancyPatch } from "@/types/vacancy";

export const vacancyKeys = {
  list: ["vacancies"] as const,
  detail: (vacancyId: string) => ["vacancies", vacancyId] as const,
  import: (importId: string) => ["vacancies", "imports", importId] as const,
};

export function useVacancies() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: vacancyKeys.list,
    queryFn: () => vacanciesRequest(getAccessToken()!),
    enabled: Boolean(accessToken),
  });
}

export function useVacancy(vacancyId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: vacancyKeys.detail(vacancyId),
    queryFn: () => vacancyRequest(getAccessToken()!, vacancyId),
    enabled: Boolean(accessToken),
  });
}

export function useVacancyImport(importId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: vacancyKeys.import(importId),
    queryFn: () => vacancyImportRequest(getAccessToken()!, importId),
    enabled: Boolean(accessToken),
  });
}

export function useImportVacancy() {
  return useMutation({
    mutationFn: (input: { url: string } | { text: string }) =>
      "url" in input
        ? importVacancyUrlRequest(getAccessToken()!, input.url)
        : importVacancyTextRequest(getAccessToken()!, input.text),
  });
}

export function useApplyVacancyImport() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({
      importId,
      draft,
    }: {
      importId: string;
      draft: VacancyDraft;
    }) => applyVacancyImportRequest(getAccessToken()!, importId, draft),
    onSuccess: () => {
      toast.success(t("toasts.vacancyAdded"));
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
    },
  });
}

export function useUpdateVacancy() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({
      vacancyId,
      patch,
    }: {
      vacancyId: string;
      patch: VacancyPatch;
    }) => updateVacancyRequest(getAccessToken()!, vacancyId, patch),
    onSuccess: (_vacancy, { vacancyId, patch }) => {
      toast.success(vacancyUpdateToast(patch, t));
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
      queryClient.invalidateQueries({ queryKey: vacancyKeys.detail(vacancyId) });
    },
  });
}

export function useDeleteVacancy() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (vacancyId: string) =>
      deleteVacancyRequest(getAccessToken()!, vacancyId),
    onSuccess: () => {
      toast.success(t("toasts.vacancyDeleted"));
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
    },
  });
}
