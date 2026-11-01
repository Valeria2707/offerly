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
import { useAuthStore } from "@/stores/auth-store";
import type { VacancyDraft, VacancyPatch } from "@/types/vacancy";

export const vacancyKeys = {
  all: ["vacancies"] as const,
  list: ["vacancies", "list"] as const,
  detail: (vacancyId: string) => ["vacancies", "detail", vacancyId] as const,
  import: (importId: string) => ["vacancies", "imports", importId] as const,
};

export function useVacancies() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: vacancyKeys.list,
    queryFn: () => vacanciesRequest(),
    enabled: Boolean(accessToken),
  });
}

export function useVacancy(vacancyId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: vacancyKeys.detail(vacancyId),
    queryFn: () => vacancyRequest(vacancyId),
    enabled: Boolean(accessToken),
  });
}

export function useVacancyImport(importId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: vacancyKeys.import(importId),
    queryFn: () => vacancyImportRequest(importId),
    enabled: Boolean(accessToken),
  });
}

export function useImportVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { url: string } | { text: string }) =>
      "url" in input
        ? importVacancyUrlRequest(input.url)
        : importVacancyTextRequest(input.text),
    onSuccess: (vacancyImport) => {
      queryClient.setQueryData(
        vacancyKeys.import(vacancyImport.id),
        vacancyImport,
      );
    },
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
    }) => applyVacancyImportRequest(importId, draft),
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
    }) => updateVacancyRequest(vacancyId, patch),
    onSuccess: (vacancy, { patch }) => {
      toast.success(vacancyUpdateToast(patch, t));
      queryClient.setQueryData(vacancyKeys.detail(vacancy.id), vacancy);
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
    },
  });
}

export function useDeleteVacancy() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (vacancyId: string) => deleteVacancyRequest(vacancyId),
    onSuccess: () => {
      toast.success(t("toasts.vacancyDeleted"));
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
    },
  });
}
