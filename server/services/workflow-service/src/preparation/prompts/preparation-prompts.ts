import { PreparationContext, StackAnalysis } from '../preparation.types';
import {
  analyzeStack,
  describeStack,
  formatList
} from '../../utils/preparation.utils';
import {
  CUSTOM_ITEMS_INSTRUCTIONS,
  CUSTOM_STAGE_FOCUS,
  CV_KEYWORDS_INSTRUCTIONS,
  CV_STAGE_INTRO,
  CV_TIPS_INSTRUCTIONS,
  HR_QUESTIONS_INSTRUCTIONS,
  HR_QUESTIONS_TO_ASK_INSTRUCTIONS,
  HR_STAGE_FOCUS,
  TECH_CODING_TASKS_INSTRUCTIONS,
  TECH_STAGE_FOCUS,
  TECH_TARGET_STACK_INSTRUCTIONS,
  UNKNOWN_LEVEL_HINT
} from './preparation-prompts.constants';

const stageFocus = (
  focusByCode: Record<string, string>,
  code: string | null,
  fallback: string
): string => (code && focusByCode[code]) || fallback;

const levelHint = (stack: StackAnalysis): string =>
  stack.level
    ? `Calibrate depth to a ${stack.level} candidate: juniors get fundamentals and "how does it work", middles get trade-offs and debugging, seniors get architecture, scaling and decision-making.`
    : UNKNOWN_LEVEL_HINT;

export function cvPrompt(context: PreparationContext): string {
  const stack = analyzeStack(context);
  return [
    CV_STAGE_INTRO,
    describeStack(stack),
    CV_TIPS_INSTRUCTIONS,
    CV_KEYWORDS_INSTRUCTIONS,
    `coverLetterDraft: 150-250 words addressed to ${stack.company}. Structure: why this role and company (use facts from the vacancy description), 2-3 strongest matching achievements from the profile tied to the required stack, one sentence that addresses the main gap with willingness to learn if gaps exist, short closing. No placeholders like [Company]; no clichés; no facts that are not in the profile.`
  ].join('\n\n');
}

export function hrPrompt(context: PreparationContext): string {
  const stack = analyzeStack(context);
  const focus = stageFocus(
    HR_STAGE_FOCUS,
    context.stage.code,
    `Soft-skills interview "${context.stage.name}": experience, motivation, teamwork and self-presentation.`
  );
  return [
    `STAGE: ${context.stage.name}. ${focus}`,
    describeStack(stack),
    `elevatorPitch: 60-90 seconds, first person, built only from the profile: current role and years of experience, 2 achievements that use the required stack (${formatList(stack.requiredSkills)}), why ${stack.role} at ${stack.company} is the logical next step.`,
    HR_QUESTIONS_INSTRUCTIONS,
    HR_QUESTIONS_TO_ASK_INSTRUCTIONS
  ].join('\n\n');
}

export function technicalPrompt(context: PreparationContext): string {
  const stack = analyzeStack(context);
  const focus = stageFocus(
    TECH_STAGE_FOCUS,
    context.stage.code,
    `Technical stage "${context.stage.name}": adapt questions and tasks to what this stage name implies.`
  );
  return [
    `STAGE: ${context.stage.name}. ${focus}`,
    describeStack(stack),
    levelHint(stack),
    TECH_TARGET_STACK_INSTRUCTIONS,
    `theoreticalQuestions (10-15): real interview questions for ${formatList(stack.requiredSkills)} at the level of this vacancy; spend at least a third of them on the gaps (${formatList(stack.missingRequiredSkills)}). Mention the technology in each question when it is not obvious. expectedAnswer: a concise but technically correct answer with key terms, a short example or code idea when helpful. tips: what the interviewer is looking for, a common mistake, or how to connect the answer to the candidate's own experience from the profile.`,
    TECH_CODING_TASKS_INSTRUCTIONS
  ].join('\n\n');
}

export function customPrompt(context: PreparationContext): string {
  const stack = analyzeStack(context);
  const focus = stageFocus(
    CUSTOM_STAGE_FOCUS,
    context.stage.code,
    `A stage defined by the user (category: ${context.stage.category}).`
  );
  return [
    `STAGE: ${context.stage.name}. ${focus}`,
    `The user's description of what will happen is the main source of truth: "${context.instructions}". Follow it closely; use the category only as a hint.`,
    describeStack(stack),
    CUSTOM_ITEMS_INSTRUCTIONS
  ].join('\n\n');
}
