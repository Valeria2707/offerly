import {
  CustomContent,
  CvCoverLetterContent,
  HrScreeningContent,
  TechnicalContent
} from './dto/preparation-content.dto';
import { PreparationType } from './preparation.enums';

export type PreparationData =
  | { type: PreparationType.CV_COVER_LETTER; content: CvCoverLetterContent }
  | { type: PreparationType.HR_SCREENING; content: HrScreeningContent }
  | { type: PreparationType.TECHNICAL; content: TechnicalContent }
  | { type: PreparationType.CUSTOM; content: CustomContent };

export interface PreparationContext {
  vacancy: Record<string, unknown>;
  profile: Record<string, unknown>;
  stage: { name: string; category: string; code: string | null };
  instructions: string;
}

export interface StackAnalysis {
  role: string;
  company: string;
  level: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  matchedSkills: string[];
  missingRequiredSkills: string[];
  experienceRequirement: string | null;
  languageRequirements: string[];
}

export interface PreparationStrategy {
  generate(context: PreparationContext): Promise<PreparationData>;
}

export type JsonSchema = {
  type: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JsonSchema;
};
