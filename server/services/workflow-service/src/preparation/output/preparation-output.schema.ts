import { PreparationType } from '../preparation.enums';
import { JsonSchema } from '../preparation.types';

const string: JsonSchema = { type: 'string' };
const array = (items: JsonSchema): JsonSchema => ({ type: 'array', items });
const object = (properties: Record<string, JsonSchema>): JsonSchema => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false
});

const questions = array(
  object({ question: string, tips: string, expectedAnswer: string })
);

export const PREPARATION_OUTPUT_SCHEMAS: Record<PreparationType, JsonSchema> = {
  [PreparationType.CV_COVER_LETTER]: object({
    cvTips: array(string),
    coverLetterDraft: string,
    tailoredKeywords: array(string)
  }),
  [PreparationType.HR_SCREENING]: object({
    elevatorPitch: string,
    commonQuestions: questions,
    questionsToAskInterviewer: array(string)
  }),
  [PreparationType.TECHNICAL]: object({
    targetStack: array(string),
    theoreticalQuestions: questions,
    codingTasks: array(object({ task: string, hint: string }))
  }),
  [PreparationType.CUSTOM]: object({ items: questions })
};
