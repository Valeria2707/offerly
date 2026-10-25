import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import { StageCategory } from '../../workflow/workflow.enums';
import { ANALYTICS_PERIODS } from '../analytics.constants';
import { FunnelStep } from '../analytics.enums';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: ANALYTICS_PERIODS,
    type: Number,
    description: 'Days to look back; omit for the whole history'
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn(ANALYTICS_PERIODS)
  period?: number;
}

export class AnalyticsSummaryDto {
  @ApiProperty({ description: 'Vacancies added inside the period' })
  added!: number;
  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Vacancies added in the previous period of the same length'
  })
  addedPrevious!: number | null;
  @ApiProperty({ description: 'Processes still going, awaiting included' })
  active!: number;
  @ApiProperty({ description: 'Processes with a stage awaiting a result' })
  awaiting!: number;
  @ApiProperty() offers!: number;
  @ApiProperty({ description: 'Offers per added vacancy, whole percent' })
  offerRate!: number;
  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Average days from adding a vacancy to an offer or rejection'
  })
  averageDays!: number | null;
}

export class FunnelStepDto {
  @ApiProperty({ enum: FunnelStep }) step!: FunnelStep;
  @ApiProperty() count!: number;
}

export class AnalyticsOutcomesDto {
  @ApiProperty() inProgress!: number;
  @ApiProperty() awaiting!: number;
  @ApiProperty() offered!: number;
  @ApiProperty({ description: 'Rejected or archived without an offer' })
  closed!: number;
}

export class WeeklyActivityDto {
  @ApiProperty({ example: '2026-10-19', description: 'Monday, UTC' })
  weekStart!: string;
  @ApiProperty({ description: 'Vacancies added during the week' })
  vacancies!: number;
  @ApiProperty({ description: 'Stages completed during the week' })
  stages!: number;
}

export class CategoryResultDto {
  @ApiProperty({ enum: StageCategory }) category!: StageCategory;
  @ApiProperty() passed!: number;
  @ApiProperty() failed!: number;
  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Passed per finished stage, whole percent'
  })
  rate!: number | null;
}

export class SkillDemandDto {
  @ApiProperty() name!: string;
  @ApiProperty({ description: 'Vacancies that require the skill' })
  count!: number;
  @ApiProperty({ description: 'The skill is present in the profile' })
  inProfile!: boolean;
}

export class WorkFormatDto {
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Null when unknown'
  })
  label!: string | null;
  @ApiProperty() count!: number;
}

export class AnalyticsDto {
  @ApiProperty({ nullable: true, type: Number }) period!: number | null;
  @ApiProperty({ type: AnalyticsSummaryDto }) summary!: AnalyticsSummaryDto;
  @ApiProperty({ type: [FunnelStepDto] }) funnel!: FunnelStepDto[];
  @ApiProperty({ type: AnalyticsOutcomesDto }) outcomes!: AnalyticsOutcomesDto;
  @ApiProperty({ type: [WeeklyActivityDto] }) weekly!: WeeklyActivityDto[];
  @ApiProperty({ type: [CategoryResultDto] }) categories!: CategoryResultDto[];
  @ApiProperty({ type: [SkillDemandDto] }) skills!: SkillDemandDto[];
  @ApiProperty({ type: [WorkFormatDto] }) workFormats!: WorkFormatDto[];
}
