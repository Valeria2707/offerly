export const PREPARATION_TYPES = [
  "CV_COVER_LETTER",
  "HR_SCREENING",
  "TECHNICAL",
  "CUSTOM",
] as const;

export type PreparationType = (typeof PREPARATION_TYPES)[number];

export type QuestionAnswerItem = {
  id: string;
  question: string;
  tips: string;
  expectedAnswer: string;
  userAnswer?: string;
};

export type CodingTask = {
  task: string;
  hint: string;
};

export type CvCoverLetterContent = {
  cvTips: string[];
  coverLetterDraft: string;
  tailoredKeywords: string[];
};

export type HrScreeningContent = {
  elevatorPitch: string;
  commonQuestions: QuestionAnswerItem[];
  questionsToAskInterviewer: string[];
};

export type TechnicalContent = {
  targetStack: string[];
  theoreticalQuestions: QuestionAnswerItem[];
  codingTasks: CodingTask[];
};

export type CustomContent = {
  instructions: string;
  items: QuestionAnswerItem[];
};

export type PreparationData =
  | { type: "CV_COVER_LETTER"; content: CvCoverLetterContent }
  | { type: "HR_SCREENING"; content: HrScreeningContent }
  | { type: "TECHNICAL"; content: TechnicalContent }
  | { type: "CUSTOM"; content: CustomContent };

export type StagePreparation = {
  id: string;
  stageId: string;
  data: PreparationData;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GeneratePreparationInput = {
  type?: PreparationType;
  instructions?: string;
};
