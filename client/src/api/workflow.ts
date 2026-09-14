import { WORKFLOW_API_BASE_URL, WORKFLOW_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  ApplicationWorkflow,
  StageStatus,
  StageType,
  StageTypeDraft,
  WorkflowStage,
} from "@/types/workflow";

const withWorkflowService = { baseUrl: WORKFLOW_API_BASE_URL };

export const stageTypesRequest = (token: string) =>
  apiRequest<StageType[]>(WORKFLOW_ROUTES.stageTypes, {
    ...withWorkflowService,
    token,
  });

export const createStageTypeRequest = (token: string, draft: StageTypeDraft) =>
  apiRequest<StageType>(WORKFLOW_ROUTES.stageTypes, {
    ...withWorkflowService,
    method: "POST",
    body: draft,
    token,
  });

export const deleteStageTypeRequest = (token: string, stageTypeId: string) =>
  apiRequest<void>(WORKFLOW_ROUTES.stageType(stageTypeId), {
    ...withWorkflowService,
    method: "DELETE",
    token,
  });

export const vacancyWorkflowRequest = (token: string, vacancyId: string) =>
  apiRequest<ApplicationWorkflow>(WORKFLOW_ROUTES.vacancyWorkflow(vacancyId), {
    ...withWorkflowService,
    token,
  });

export const addWorkflowStageRequest = (
  token: string,
  workflowId: string,
  stageTypeId: string,
) =>
  apiRequest<WorkflowStage>(WORKFLOW_ROUTES.stages(workflowId), {
    ...withWorkflowService,
    method: "POST",
    body: { stageTypeId },
    token,
  });

export const updateWorkflowStageRequest = (
  token: string,
  workflowId: string,
  stageId: string,
  status: StageStatus,
) =>
  apiRequest<WorkflowStage>(WORKFLOW_ROUTES.stage(workflowId, stageId), {
    ...withWorkflowService,
    method: "PATCH",
    body: { status },
    token,
  });

export const reorderWorkflowStagesRequest = (
  token: string,
  workflowId: string,
  stageIds: string[],
) =>
  apiRequest<ApplicationWorkflow>(WORKFLOW_ROUTES.stagesOrder(workflowId), {
    ...withWorkflowService,
    method: "PUT",
    body: { groups: stageIds.map((stageId) => ({ stageIds: [stageId] })) },
    token,
  });

export const removeWorkflowStageRequest = (
  token: string,
  workflowId: string,
  stageId: string,
) =>
  apiRequest<void>(WORKFLOW_ROUTES.stage(workflowId, stageId), {
    ...withWorkflowService,
    method: "DELETE",
    token,
  });
