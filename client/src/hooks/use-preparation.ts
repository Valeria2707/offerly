"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  answerPreparationQuestionRequest,
  deletePreparationRequest,
  generatePreparationRequest,
  preparationRequest,
} from "@/api/preparation";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { GeneratePreparationInput } from "@/types/preparation";

export const preparationKeys = {
  stage: (stageId: string) => ["preparation", stageId] as const,
};

export function usePreparation(workflowId: string, stageId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: preparationKeys.stage(stageId),
    queryFn: () => preparationRequest(getAccessToken()!, workflowId, stageId),
    enabled: Boolean(accessToken) && Boolean(workflowId),
    retry: false,
  });
}

export function useGeneratePreparation(workflowId: string, stageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GeneratePreparationInput) =>
      generatePreparationRequest(
        getAccessToken()!,
        workflowId,
        stageId,
        input,
      ),
    onSuccess: (preparation) => {
      queryClient.setQueryData(preparationKeys.stage(stageId), preparation);
    },
  });
}

export function useAnswerPreparationQuestion(
  workflowId: string,
  stageId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      userAnswer,
    }: {
      questionId: string;
      userAnswer: string;
    }) =>
      answerPreparationQuestionRequest(
        getAccessToken()!,
        workflowId,
        stageId,
        questionId,
        userAnswer,
      ),
    onSuccess: (preparation) => {
      queryClient.setQueryData(preparationKeys.stage(stageId), preparation);
    },
  });
}

export function useDeletePreparation(workflowId: string, stageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      deletePreparationRequest(getAccessToken()!, workflowId, stageId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: preparationKeys.stage(stageId) });
    },
  });
}
