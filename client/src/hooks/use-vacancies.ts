"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyVacancyImportRequest,
  importVacancyTextRequest,
  importVacancyUrlRequest,
  updateVacancyRequest,
  vacanciesRequest,
  vacancyImportRequest,
} from "@/api/vacancies";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { VacancyDraft } from "@/types/vacancy";

export const vacancyKeys = {
  list: ["vacancies"] as const,
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

  return useMutation({
    mutationFn: ({
      importId,
      draft,
    }: {
      importId: string;
      draft: VacancyDraft;
    }) => applyVacancyImportRequest(getAccessToken()!, importId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
    },
  });
}

export function useUpdateVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vacancyId,
      draft,
    }: {
      vacancyId: string;
      draft: VacancyDraft;
    }) => updateVacancyRequest(getAccessToken()!, vacancyId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vacancyKeys.list });
    },
  });
}
