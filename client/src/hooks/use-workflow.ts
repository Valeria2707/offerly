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
  stageTypesRequest,
  updateStageQuestionRequest,
  updateWorkflowStageRequest,
  vacancyWorkflowRequest,
  workflowSummariesRequest,
} from "@/api/workflow";
import type { BoardColumn } from "@/constants/board";
import { analyticsKeys } from "@/hooks/use-analytics";
import { calendarKeys } from "@/hooks/use-calendar";
import { useNotifyError } from "@/hooks/use-error-message";
import { planMove } from "@/lib/board";
import { boardMoveToast, stageUpdateToast } from "@/lib/toasts";
import { useAuthStore } from "@/stores/auth-store";
import type {
  StageQuestionDraft,
  StageTypeDraft,
  WorkflowStagePatch,
} from "@/types/workflow";

export const workflowKeys = {
  stageTypes: ["stage-types"] as const,
  vacancy: (vacancyId: string) => ["workflows", vacancyId] as const,
  summaries: ["workflows", "summary"] as const,
  summary: (vacancyIds: string[]) =>
    ["workflows", "summary", vacancyIds] as const,
};

export function invalidateStageQueries(
  queryClient: QueryClient,
  vacancyId: string,
) {
  queryClient.invalidateQueries({ queryKey: workflowKeys.vacancy(vacancyId) });
  queryClient.invalidateQueries({ queryKey: workflowKeys.summaries });
  queryClient.invalidateQueries({ queryKey: calendarKeys.all });
  queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
}

export function useStageTypes() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: workflowKeys.stageTypes,
    queryFn: () => stageTypesRequest(),
    enabled: Boolean(accessToken),
  });
}

export function useCreateStageType() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (draft: StageTypeDraft) => createStageTypeRequest(draft),
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
    mutationFn: (stageTypeId: string) => deleteStageTypeRequest(stageTypeId),
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
    queryFn: () => workflowSummariesRequest(vacancyIds),
    enabled: Boolean(accessToken) && vacancyIds.length > 0,
    select: (summaries) =>
      new Map(summaries.map((summary) => [summary.vacancyId, summary])),
  });
}

export function useVacancyWorkflow(vacancyId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: workflowKeys.vacancy(vacancyId),
    queryFn: () => vacancyWorkflowRequest(vacancyId),
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
      for (const stageTypeId of stageTypeIds)
        await addWorkflowStageRequest(workflowId, stageTypeId);
    },
    onSuccess: () => {
      invalidateStageQueries(queryClient, vacancyId);
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
    }) => reorderWorkflowStagesRequest(workflowId, stageIds),
    onSuccess: () => {
      invalidateStageQueries(queryClient, vacancyId);
      toast.success(t("toasts.stagesReordered"));
    },
  });
}

/** Any change of one stage: status, dates, rejection reason, artifact. */
export function useUpdateWorkflowStage() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      patch,
    }: {
      vacancyId: string;
      workflowId: string;
      stageId: string;
      patch: WorkflowStagePatch;
    }) => updateWorkflowStageRequest(workflowId, stageId, patch),
    onSuccess: (_stage, { vacancyId, patch }) => {
      invalidateStageQueries(queryClient, vacancyId);
      toast.success(stageUpdateToast(patch, t));
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
    }: {
      vacancyId: string;
      target: BoardColumn;
    }) => {
      const [workflow, stageTypes] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: workflowKeys.vacancy(vacancyId),
          queryFn: () => vacancyWorkflowRequest(vacancyId),
          staleTime: 0,
        }),
        queryClient.ensureQueryData({
          queryKey: workflowKeys.stageTypes,
          queryFn: () => stageTypesRequest(),
        }),
      ]);
      const codes = new Map(stageTypes.map((type) => [type.id, type.code]));

      for (const step of planMove(workflow.stages, codes, target))
        await updateWorkflowStageRequest(workflow.id, step.stageId, {
          status: step.status,
        });
    },
    onSuccess: (_result, { target }) =>
      toast.success(boardMoveToast(target, t)),
    onSettled: (_result, _error, { vacancyId }) =>
      invalidateStageQueries(queryClient, vacancyId),
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
    }) => removeWorkflowStageRequest(workflowId, stageId),
    onSuccess: () => {
      invalidateStageQueries(queryClient, vacancyId);
      toast.success(t("toasts.stageRemoved"));
    },
  });
}

type StageRef = {
  vacancyId: string;
  workflowId: string | undefined;
  stageId: string | undefined;
};

export function useStageNotes({ vacancyId, workflowId, stageId }: StageRef) {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const notify = useNotifyError("stage-notes");
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: workflowKeys.vacancy(vacancyId),
    });

  const add = useMutation({
    mutationFn: (content: string) =>
      addStageNoteRequest(workflowId!, stageId!, content),
    onSuccess: () => {
      toast.success(t("toasts.noteAdded"));
      refresh();
    },
    onError: notify,
  });
  const remove = useMutation({
    mutationFn: (noteId: string) =>
      removeStageNoteRequest(workflowId!, stageId!, noteId),
    onSuccess: () => {
      toast.success(t("toasts.noteRemoved"));
      refresh();
    },
    onError: notify,
  });

  return {
    add: (content: string) => add.mutate(content),
    remove: (noteId: string) => remove.mutate(noteId),
    pending: add.isPending || remove.isPending,
  };
}

export function useStageQuestions({
  vacancyId,
  workflowId,
  stageId,
}: StageRef) {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const notify = useNotifyError("stage-questions");
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: workflowKeys.vacancy(vacancyId),
    });

  const add = useMutation({
    mutationFn: (draft: StageQuestionDraft) =>
      addStageQuestionRequest(workflowId!, stageId!, draft),
    onSuccess: () => {
      toast.success(t("toasts.questionAdded"));
      refresh();
    },
    onError: notify,
  });
  const update = useMutation({
    mutationFn: ({
      questionId,
      draft,
    }: {
      questionId: string;
      draft: StageQuestionDraft;
    }) => updateStageQuestionRequest(workflowId!, stageId!, questionId, draft),
    onSuccess: () => {
      toast.success(t("toasts.questionUpdated"));
      refresh();
    },
    onError: notify,
  });
  const remove = useMutation({
    mutationFn: (questionId: string) =>
      removeStageQuestionRequest(workflowId!, stageId!, questionId),
    onSuccess: () => {
      toast.success(t("toasts.questionRemoved"));
      refresh();
    },
    onError: notify,
  });

  return {
    add: (draft: StageQuestionDraft) => add.mutate(draft),
    update: (questionId: string, draft: StageQuestionDraft) =>
      update.mutate({ questionId, draft }),
    remove: (questionId: string) => remove.mutate(questionId),
    pending: add.isPending || update.isPending || remove.isPending,
  };
}
