import { StageCategory } from '../workflow/workflow.enums';

export const SYSTEM_STAGE_TYPES = [
  {
    code: 'submitted',
    name: 'Submitted',
    category: StageCategory.ADMINISTRATIVE,
    expectedDurationMinutes: null,
    requiresPreparation: false,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'hr_screening',
    name: 'HR screening',
    category: StageCategory.SCREENING,
    expectedDurationMinutes: 30,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'pre_tech_screening',
    name: 'Pre-tech screening',
    category: StageCategory.SCREENING,
    expectedDurationMinutes: 30,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'test_task',
    name: 'Test task',
    category: StageCategory.TECHNICAL,
    expectedDurationMinutes: null,
    requiresPreparation: true,
    supportsDeadline: true,
    producesArtifact: true,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'technical_interview',
    name: 'Technical interview',
    category: StageCategory.TECHNICAL,
    expectedDurationMinutes: 60,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'live_coding',
    name: 'Live coding',
    category: StageCategory.TECHNICAL,
    expectedDurationMinutes: 60,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: true,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'system_design',
    name: 'System Design',
    category: StageCategory.TECHNICAL,
    expectedDurationMinutes: 60,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'team_interview',
    name: 'Team interview',
    category: StageCategory.BEHAVIORAL,
    expectedDurationMinutes: 45,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'culture_fit',
    name: 'Culture fit',
    category: StageCategory.BEHAVIORAL,
    expectedDurationMinutes: 30,
    requiresPreparation: false,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'final_interview',
    name: 'Final interview',
    category: StageCategory.BEHAVIORAL,
    expectedDurationMinutes: 45,
    requiresPreparation: true,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'offer_negotiation',
    name: 'Offer negotiation',
    category: StageCategory.ADMINISTRATIVE,
    expectedDurationMinutes: null,
    requiresPreparation: false,
    supportsDeadline: true,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'offer',
    name: 'Offer',
    category: StageCategory.ADMINISTRATIVE,
    expectedDurationMinutes: null,
    requiresPreparation: false,
    supportsDeadline: true,
    producesArtifact: true,
    ownerUserId: null,
    isActive: true
  },
  {
    code: 'rejection',
    name: 'Rejection',
    category: StageCategory.ADMINISTRATIVE,
    expectedDurationMinutes: null,
    requiresPreparation: false,
    supportsDeadline: false,
    producesArtifact: false,
    ownerUserId: null,
    isActive: true
  }
];
