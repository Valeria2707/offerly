import { PreparationTarget } from './preparation.enums';

export interface PreparationSources {
  profile: Record<string, unknown>;
  vacancy: Record<string, unknown>;
}

export interface HrDocuments {
  cv: string;
  coverLetter: string;
}

export interface PreparationRevision {
  prompt: string;
  target: PreparationTarget;
  current: HrDocuments;
}
