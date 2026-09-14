"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addWorkflowStageRequest,
  createStageTypeRequest,
  deleteStageTypeRequest,
  removeWorkflowStageRequest,
  reorderWorkflowStagesRequest,
  stageTypesRequest,
  updateWorkflowStageRequest,
  vacancyWorkflowRequest,
} from "@/api/workflow";
import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { StageStatus, StageTypeDraft } from "@/types/workflow";

export const workflowKeys = {
  stageTypes: ["stage-types"] as const,
  vacancy: (vacancyId: string) => ["workflows", vacancyId] as const,
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
      status,
    }: {
      workflowId: string;
      stageId: string;
      status: StageStatus;
    }) =>
      updateWorkflowStageRequest(
        getAccessToken()!,
        workflowId,
        stageId,
        status,
      ),
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
