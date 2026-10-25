"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

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
import type { BoardColumn } from "@/constants/board";
import { planMove } from "@/lib/board";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type {
  StageQuestionDraft,
  StageStatus,
  StageTypeDraft,
  WorkflowStagePatch,
} from "@/types/workflow";

export const workflowKeys = {
  stageTypes: ["stage-types"] as const,
  vacancy: (vacancyId: string) => ["workflows", vacancyId] as const,
  summary: (vacancyIds: string[]) =>
    ["workflows", "summary", vacancyIds] as const,
};

function invalidateStages(queryClient: QueryClient, vacancyId: string) {
  queryClient.invalidateQueries({ queryKey: workflowKeys.vacancy(vacancyId) });
  queryClient.invalidateQueries({ queryKey: ["workflows", "summary"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
}

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
    onSuccess: () => invalidateStages(queryClient, vacancyId),
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
    onSuccess: () => invalidateStages(queryClient, vacancyId),
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
    onSuccess: () => invalidateStages(queryClient, vacancyId),
  });
}

export function useRecordStageResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      status,
    }: {
      vacancyId: string;
      workflowId: string;
      stageId: string;
      status: StageStatus;
    }) =>
      updateWorkflowStageRequest(getAccessToken()!, workflowId, stageId, {
        status,
      }),
    onSuccess: (_stage, { vacancyId }) =>
      invalidateStages(queryClient, vacancyId),
  });
}

export function useMoveOnBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vacancyId,
      target,
      codes,
    }: {
      vacancyId: string;
      target: BoardColumn;
      codes: Map<string, string | null>;
    }) => {
      const token = getAccessToken()!;
      const workflow = await queryClient.fetchQuery({
        queryKey: workflowKeys.vacancy(vacancyId),
        queryFn: () => vacancyWorkflowRequest(token, vacancyId),
        staleTime: 0,
      });

      for (const step of planMove(workflow.stages, codes, target))
        await updateWorkflowStageRequest(token, workflow.id, step.stageId, {
          status: step.status,
        });
    },
    onSettled: (_result, _error, { vacancyId }) =>
      invalidateStages(queryClient, vacancyId),
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
    onSuccess: () => invalidateStages(queryClient, vacancyId),
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
