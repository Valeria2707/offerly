import { DataSource } from 'typeorm';
import { StageType } from '../stage-type/entities/stage-type.entity';
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
    'submitted',
    'Submitted',
    StageCategory.ADMINISTRATIVE,
    null,
    false,
    false,
    false
  ),
  stage(
    'hr_screening',
    'HR screening',
    StageCategory.SCREENING,
    30,
    true,
    false,
    false
  ),
  stage(
    'pre_tech_screening',
    'Pre-tech screening',
    StageCategory.SCREENING,
    30,
    true,
    false,
    false
  ),
  stage(
    'test_task',
    'Test task',
    StageCategory.TECHNICAL,
    null,
    true,
    true,
    true
  ),
  stage(
    'technical_interview',
    'Technical interview',
    StageCategory.TECHNICAL,
    60,
    true,
    false,
    false
  ),
  stage(
    'live_coding',
    'Live coding',
    StageCategory.TECHNICAL,
    60,
    true,
    false,
    true
  ),
  stage(
    'system_design',
    'System Design',
    StageCategory.TECHNICAL,
    60,
    true,
    false,
    false
  ),
  stage(
    'team_interview',
    'Team interview',
    StageCategory.BEHAVIORAL,
    45,
    true,
    false,
    false
  ),
  stage(
    'culture_fit',
    'Culture fit',
    StageCategory.BEHAVIORAL,
    30,
    false,
    false,
    false
  ),
  stage(
    'final_interview',
    'Final interview',
    StageCategory.BEHAVIORAL,
    45,
    true,
    false,
    false
  ),
  stage(
    'offer_negotiation',
    'Offer negotiation',
    StageCategory.ADMINISTRATIVE,
    null,
    false,
    true,
    false
  ),
  stage(
    'offer',
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
    .orIgnore()
    .execute();
}
