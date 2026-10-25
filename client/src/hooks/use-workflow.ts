"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
import { boardMoveToast, stageUpdateToast } from "@/lib/toasts";
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
  const t = useTranslations();

  return useMutation({
    mutationFn: (draft: StageTypeDraft) =>
      createStageTypeRequest(getAccessToken()!, draft),
    onSuccess: () => {
      toast.success(t("toasts.stageTypeCreated"));
      queryClient.invalidateQueries({ queryKey: workflowKeys.stageTypes });
    },
  });
}

export function useDeleteStageType() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (stageTypeId: string) =>
      deleteStageTypeRequest(getAccessToken()!, stageTypeId),
    onSuccess: () => {
      toast.success(t("toasts.stageTypeDeleted"));
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
  const t = useTranslations();

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
      invalidateStages(queryClient, vacancyId);
      toast.success(t("toasts.stagesAdded"));
    },
  });
}

export function useReorderWorkflowStages(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageIds,
    }: {
      workflowId: string;
      stageIds: string[];
    }) => reorderWorkflowStagesRequest(getAccessToken()!, workflowId, stageIds),
    onSuccess: () => {
      invalidateStages(queryClient, vacancyId);
      toast.success(t("toasts.stagesReordered"));
    },
  });
}

export function useUpdateWorkflowStage(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
    onSuccess: (_stage, { patch }) => {
      invalidateStages(queryClient, vacancyId);
      toast.success(stageUpdateToast(patch, t));
    },
  });
}

export function useRecordStageResult() {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
    onSuccess: (_stage, { vacancyId, status }) => {
      invalidateStages(queryClient, vacancyId);
      toast.success(stageUpdateToast({ status }, t));
    },
  });
}

export function useMoveOnBoard() {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
    onSuccess: (_result, { target }) =>
      toast.success(boardMoveToast(target, t)),
    onSettled: (_result, _error, { vacancyId }) =>
      invalidateStages(queryClient, vacancyId),
  });
}

export function useRemoveWorkflowStage(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
    }: {
      workflowId: string;
      stageId: string;
    }) => removeWorkflowStageRequest(getAccessToken()!, workflowId, stageId),
    onSuccess: () => {
      invalidateStages(queryClient, vacancyId);
      toast.success(t("toasts.stageRemoved"));
    },
  });
}

export function useAddStageNote(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.success(t("toasts.noteAdded"));
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useUpdateStageNote(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.success(t("toasts.noteUpdated"));
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useRemoveStageNote(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.success(t("toasts.noteRemoved"));
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useAddStageQuestion(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.success(t("toasts.questionAdded"));
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useUpdateStageQuestion(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.success(t("toasts.questionUpdated"));
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}

export function useRemoveStageQuestion(vacancyId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations();

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
      toast.success(t("toasts.questionRemoved"));
      queryClient.invalidateQueries({
        queryKey: workflowKeys.vacancy(vacancyId),
      });
    },
  });
}
