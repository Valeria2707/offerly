export enum StageCategory {
  SCREENING = 'screening',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  ADMINISTRATIVE = 'administrative'
}
export enum StageStatus {
  NOT_STARTED = 'not_started',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  AWAITING_RESULT = 'awaiting_result',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped',
  CANCELLED_BY_COMPANY = 'cancelled_by_company'
}

export enum RejectionReason {
  SKILLS = 'skills',
  EXPERIENCE = 'experience',
  SALARY = 'salary',
  LANGUAGE = 'language',
  LOCATION = 'location',
  CULTURE_FIT = 'culture_fit',
  TEST_TASK = 'test_task',
  POSITION_CLOSED = 'position_closed',
  OTHER_CANDIDATE = 'other_candidate',
  CANDIDATE_DECLINED = 'candidate_declined',
  NO_REASON = 'no_reason',
  OTHER = 'other'
}
