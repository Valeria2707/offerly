export const STAGE_CODES = {
  SUBMITTED: 'submitted',
  HR_SCREENING: 'hr_screening',
  PRE_TECH_SCREENING: 'pre_tech_screening',
  TECHNICAL_INTERVIEW: 'technical_interview',
  LIVE_CODING: 'live_coding',
  SYSTEM_DESIGN: 'system_design',
  TEST_TASK: 'test_task',
  TEAM_INTERVIEW: 'team_interview',
  CULTURE_FIT: 'culture_fit',
  FINAL_INTERVIEW: 'final_interview',
  OFFER_NEGOTIATION: 'offer_negotiation',
  OFFER: 'offer'
} as const;

export const DEFAULT_STAGE_CODES: string[] = [
  STAGE_CODES.SUBMITTED,
  STAGE_CODES.HR_SCREENING,
  STAGE_CODES.TECHNICAL_INTERVIEW,
  STAGE_CODES.FINAL_INTERVIEW,
  STAGE_CODES.OFFER
];
