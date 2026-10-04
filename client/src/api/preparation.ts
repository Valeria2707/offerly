import { WORKFLOW_API_BASE_URL, WORKFLOW_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  GeneratePreparationInput,
  StagePreparation,
} from "@/types/preparation";

const withWorkflowService = { baseUrl: WORKFLOW_API_BASE_URL };

export const preparationRequest = (
  token: string,
  workflowId: string,
  stageId: string,
) =>
  apiRequest<StagePreparation>(WORKFLOW_ROUTES.preparation(workflowId, stageId), {
    ...withWorkflowService,
    token,
  });

export const generatePreparationRequest = (
  token: string,
  workflowId: string,
  stageId: string,
  input: GeneratePreparationInput,
) =>
  apiRequest<StagePreparation>(WORKFLOW_ROUTES.preparation(workflowId, stageId), {
    ...withWorkflowService,
    method: "POST",
    body: input,
    token,
  });

export const answerPreparationQuestionRequest = (
  token: string,
  workflowId: string,
  stageId: string,
  questionId: string,
  userAnswer: string,
) =>
  apiRequest<StagePreparation>(
    WORKFLOW_ROUTES.preparationAnswer(workflowId, stageId, questionId),
    {
      ...withWorkflowService,
      method: "PATCH",
      body: { userAnswer },
      token,
    },
  );

export const deletePreparationRequest = (
  token: string,
  workflowId: string,
  stageId: string,
) =>
  apiRequest<void>(WORKFLOW_ROUTES.preparation(workflowId, stageId), {
    ...withWorkflowService,
    method: "DELETE",
    token,
  });
