import { WORKFLOW_API_BASE_URL, WORKFLOW_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  ApplicationWorkflow,
  StageNote,
  StageQuestion,
  StageQuestionDraft,
  StageType,
  StageTypeDraft,
  WorkflowStage,
  WorkflowStagePatch,
  WorkflowSummary,
} from "@/types/workflow";

const withWorkflowService = { baseUrl: WORKFLOW_API_BASE_URL };

export const stageTypesRequest = () =>
  apiRequest<StageType[]>(WORKFLOW_ROUTES.stageTypes, {
    ...withWorkflowService,
  });

export const createStageTypeRequest = (draft: StageTypeDraft) =>
  apiRequest<StageType>(WORKFLOW_ROUTES.stageTypes, {
    ...withWorkflowService,
    method: "POST",
    body: draft,
  });

export const deleteStageTypeRequest = (stageTypeId: string) =>
  apiRequest<void>(WORKFLOW_ROUTES.stageType(stageTypeId), {
    ...withWorkflowService,
    method: "DELETE",
  });

export const workflowSummariesRequest = (vacancyIds: string[]) =>
  apiRequest<WorkflowSummary[]>(WORKFLOW_ROUTES.workflowSummary(vacancyIds), {
    ...withWorkflowService,
  });

export const vacancyWorkflowRequest = (vacancyId: string) =>
  apiRequest<ApplicationWorkflow>(WORKFLOW_ROUTES.vacancyWorkflow(vacancyId), {
    ...withWorkflowService,
  });

export const addWorkflowStageRequest = (
  workflowId: string,
  stageTypeId: string,
) =>
  apiRequest<WorkflowStage>(WORKFLOW_ROUTES.stages(workflowId), {
    ...withWorkflowService,
    method: "POST",
    body: { stageTypeId },
  });

export const updateWorkflowStageRequest = (
  workflowId: string,
  stageId: string,
  patch: WorkflowStagePatch,
) =>
  apiRequest<WorkflowStage>(WORKFLOW_ROUTES.stage(workflowId, stageId), {
    ...withWorkflowService,
    method: "PATCH",
    body: patch,
  });

export const reorderWorkflowStagesRequest = (
  workflowId: string,
  stageIds: string[],
) =>
  apiRequest<ApplicationWorkflow>(WORKFLOW_ROUTES.stagesOrder(workflowId), {
    ...withWorkflowService,
    method: "PUT",
    body: { groups: stageIds.map((stageId) => ({ stageIds: [stageId] })) },
  });

export const addStageQuestionRequest = (
  workflowId: string,
  stageId: string,
  draft: StageQuestionDraft,
) =>
  apiRequest<StageQuestion>(
    WORKFLOW_ROUTES.stageQuestions(workflowId, stageId),
    { ...withWorkflowService, method: "POST", body: draft },
  );

export const updateStageQuestionRequest = (
  workflowId: string,
  stageId: string,
  questionId: string,
  draft: StageQuestionDraft,
) =>
  apiRequest<StageQuestion>(
    WORKFLOW_ROUTES.stageQuestion(workflowId, stageId, questionId),
    { ...withWorkflowService, method: "PATCH", body: draft },
  );

export const removeStageQuestionRequest = (
  workflowId: string,
  stageId: string,
  questionId: string,
) =>
  apiRequest<void>(
    WORKFLOW_ROUTES.stageQuestion(workflowId, stageId, questionId),
    { ...withWorkflowService, method: "DELETE" },
  );

export const addStageNoteRequest = (
  workflowId: string,
  stageId: string,
  content: string,
) =>
  apiRequest<StageNote>(WORKFLOW_ROUTES.stageNotes(workflowId, stageId), {
    ...withWorkflowService,
    method: "POST",
    body: { content },
  });

export const removeStageNoteRequest = (
  workflowId: string,
  stageId: string,
  noteId: string,
) =>
  apiRequest<void>(WORKFLOW_ROUTES.stageNote(workflowId, stageId, noteId), {
    ...withWorkflowService,
    method: "DELETE",
  });

export const removeWorkflowStageRequest = (
  workflowId: string,
  stageId: string,
) =>
  apiRequest<void>(WORKFLOW_ROUTES.stage(workflowId, stageId), {
    ...withWorkflowService,
    method: "DELETE",
  });
