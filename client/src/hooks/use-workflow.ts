"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addStageNoteRequest,
  addStageQuestionRequest,
  addWorkflowStageRequest,
  createStageTypeRequest,
  deleteStageTypeRequest,
  removeStageNoteRequest,
  removeStageQuestionRequest,
  removeWorkflowStageRequest,
  reorderWorkflowStagesRequest,
  updateStageNoteRequest,
  updateStageQuestionRequest,
  stageTypesRequest,
  updateWorkflowStageRequest,
  vacancyWorkflowRequest,
  workflowSummariesRequest,
} from "@/api/workflow";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type {
  StageQuestionDraft,
  StageTypeDraft,
  WorkflowStagePatch,
} from "@/types/workflow";

export const workflowKeys = {
  stageTypes: ["stage-types"] as const,
  vacancy: (vacancyId: string) => ["workflows", vacancyId] as const,
  summary: (vacancyIds: string[]) =>
    ["workflows", "summary", vacancyIds] as const,
};

export function useStageTypes() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: workflowKeys.stageTypes,
    queryFn: () => stageTypesRequest(getAccessToken()!),
    enabled: Boolean(accessToken),
  });
}

export function useCreateStageType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: StageTypeDraft) =>
      createStageTypeRequest(getAccessToken()!, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.stageTypes });
    },
  });
}

export function useDeleteStageType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stageTypeId: string) =>
      deleteStageTypeRequest(getAccessToken()!, stageTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.stageTypes });
    },
  });
}

export function useWorkflowSummaries(vacancyIds: string[]) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: workflowKeys.summary(vacancyIds),
    queryFn: () => workflowSummariesRequest(getAccessToken()!, vacancyIds),
    enabled: Boolean(accessToken) && vacancyIds.length > 0,
    select: (summaries) =>
      new Map(summaries.map((summary) => [summary.vacancyId, summary])),
  });
}

export function useVacancyWorkflow(vacancyId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: workflowKeys.vacancy(vacancyId),
    queryFn: () => vacancyWorkflowRequest(getAccessToken()!, vacancyId),
    enabled: Boolean(accessToken),
    retry: false,
  });
}

export function useAddWorkflowStages(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      stageTypeIds,
    }: {
      workflowId: string;
      stageTypeIds: string[];
    }) => {
      const token = getAccessToken()!;

      for (const stageTypeId of stageTypeIds)
        await addWorkflowStageRequest(token, workflowId, stageTypeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useReorderWorkflowStages(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageIds,
    }: {
      workflowId: string;
      stageIds: string[];
    }) => reorderWorkflowStagesRequest(getAccessToken()!, workflowId, stageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useUpdateWorkflowStage(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      patch,
    }: {
      workflowId: string;
      stageId: string;
      patch: WorkflowStagePatch;
    }) =>
      updateWorkflowStageRequest(getAccessToken()!, workflowId, stageId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useRemoveWorkflowStage(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
    }: {
      workflowId: string;
      stageId: string;
    }) => removeWorkflowStageRequest(getAccessToken()!, workflowId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useAddStageNote(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      content,
    }: {
      workflowId: string;
      stageId: string;
      content: string;
    }) => addStageNoteRequest(getAccessToken()!, workflowId, stageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useUpdateStageNote(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      noteId,
      content,
    }: {
      workflowId: string;
      stageId: string;
      noteId: string;
      content: string;
    }) =>
      updateStageNoteRequest(
        getAccessToken()!,
        workflowId,
        stageId,
        noteId,
        content,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useRemoveStageNote(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      noteId,
    }: {
      workflowId: string;
      stageId: string;
      noteId: string;
    }) =>
      removeStageNoteRequest(getAccessToken()!, workflowId, stageId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useAddStageQuestion(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      draft,
    }: {
      workflowId: string;
      stageId: string;
      draft: StageQuestionDraft;
    }) =>
      addStageQuestionRequest(getAccessToken()!, workflowId, stageId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useUpdateStageQuestion(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      questionId,
      draft,
    }: {
      workflowId: string;
      stageId: string;
      questionId: string;
      draft: StageQuestionDraft;
    }) =>
      updateStageQuestionRequest(
        getAccessToken()!,
        workflowId,
        stageId,
        questionId,
        draft,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useRemoveStageQuestion(vacancyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      questionId,
    }: {
      workflowId: string;
      stageId: string;
      questionId: string;
    }) =>
      removeStageQuestionRequest(
        getAccessToken()!,
        workflowId,
        stageId,
        questionId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}
