import { WORKFLOW_API_BASE_URL, WORKFLOW_ROUTES } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  GeneratePreparationInput,
  StagePreparation,
} from "@/types/preparation";

const withWorkflowService = { baseUrl: WORKFLOW_API_BASE_URL };

export const preparationRequest = (workflowId: string, stageId: string) =>
  apiRequest<StagePreparation>(
    WORKFLOW_ROUTES.preparation(workflowId, stageId),
    {
      ...withWorkflowService,
    },
  );

export const generatePreparationRequest = (
  workflowId: string,
  stageId: string,
  input: GeneratePreparationInput,
) =>
  apiRequest<StagePreparation>(
    WORKFLOW_ROUTES.preparation(workflowId, stageId),
    {
      ...withWorkflowService,
      method: "POST",
      body: input,
    },
  );

export const answerPreparationQuestionRequest = (
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
    },
  );

export const reviewPreparationAnswerRequest = (
  workflowId: string,
  stageId: string,
  questionId: string,
  userAnswer: string,
) =>
  apiRequest<StagePreparation>(
    WORKFLOW_ROUTES.preparationReview(workflowId, stageId, questionId),
    {
      ...withWorkflowService,
      method: "POST",
      body: { userAnswer },
    },
  );

export const deletePreparationRequest = (workflowId: string, stageId: string) =>
  apiRequest<void>(WORKFLOW_ROUTES.preparation(workflowId, stageId), {
    ...withWorkflowService,
    method: "DELETE",
  });
