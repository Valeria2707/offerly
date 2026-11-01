import { DataSource } from 'typeorm';
import { StageType } from '../stage-type/entities/stage-type.entity';
import { STAGE_CODES } from '../stage-type/stage-type.constants';
import { StageCategory } from '../workflow/workflow.enums';

type SystemStageType = Pick<
  StageType,
  | 'code'
  | 'name'
  | 'category'
  | 'expectedDurationMinutes'
  | 'requiresPreparation'
  | 'supportsDeadline'
  | 'producesArtifact'
>;

const stage = (
  code: string,
  name: string,
  category: StageCategory,
  expectedDurationMinutes: number | null,
  requiresPreparation: boolean,
  supportsDeadline: boolean,
  producesArtifact: boolean
): SystemStageType => ({
  code,
  name,
  category,
  expectedDurationMinutes,
  requiresPreparation,
  supportsDeadline,
  producesArtifact
});

export const SYSTEM_STAGE_TYPES: SystemStageType[] = [
  stage(
    STAGE_CODES.SUBMITTED,
    'Submitted',
    StageCategory.ADMINISTRATIVE,
    null,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.HR_SCREENING,
    'HR screening',
    StageCategory.SCREENING,
    30,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.PRE_TECH_SCREENING,
    'Pre-tech screening',
    StageCategory.SCREENING,
    30,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.TEST_TASK,
    'Test task',
    StageCategory.TECHNICAL,
    null,
    true,
    true,
    true
  ),
  stage(
    STAGE_CODES.TECHNICAL_INTERVIEW,
    'Technical interview',
    StageCategory.TECHNICAL,
    60,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.LIVE_CODING,
    'Live coding',
    StageCategory.TECHNICAL,
    60,
    true,
    false,
    true
  ),
  stage(
    STAGE_CODES.SYSTEM_DESIGN,
    'System Design',
    StageCategory.TECHNICAL,
    60,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.TEAM_INTERVIEW,
    'Team interview',
    StageCategory.BEHAVIORAL,
    45,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.CULTURE_FIT,
    'Culture fit',
    StageCategory.BEHAVIORAL,
    30,
    false,
    false,
    false
  ),
  stage(
    STAGE_CODES.FINAL_INTERVIEW,
    'Final interview',
    StageCategory.BEHAVIORAL,
    45,
    true,
    false,
    false
  ),
  stage(
    STAGE_CODES.OFFER_NEGOTIATION,
    'Offer negotiation',
    StageCategory.ADMINISTRATIVE,
    null,
    false,
    true,
    false
  ),
  stage(
    STAGE_CODES.OFFER,
    'Offer',
    StageCategory.ADMINISTRATIVE,
    null,
    false,
    true,
    true
  )
];

export async function seedStageTypes(dataSource: DataSource): Promise<void> {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(StageType)
    .values(SYSTEM_STAGE_TYPES)
    .orUpdate(
      [
        'name',
        'category',
        'expected_duration_minutes',
        'requires_preparation',
        'supports_deadline',
        'produces_artifact'
      ],
      ['code']
    )
    .execute();
}
