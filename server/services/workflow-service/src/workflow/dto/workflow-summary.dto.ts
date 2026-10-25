import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import {
  RejectionReason,
  StageCategory,
  StageStatus
} from '../workflow.enums';

export class WorkflowSummaryQueryDto {
  @ApiProperty({
    description: 'Comma-separated vacancy ids',
    example: 'b0f1…,c2a3…'
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value
  )
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  vacancyIds!: string[];
}

export class StageBriefDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Catalog code; null for personal stage types'
  })
  code!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: StageCategory }) category!: StageCategory;
  @ApiProperty({ enum: StageStatus }) status!: StageStatus;
  @ApiProperty({ nullable: true, type: Date }) scheduledAt!: Date | null;
  @ApiProperty({ nullable: true, type: Date }) deadlineAt!: Date | null;
  @ApiProperty({ nullable: true, type: Date }) completedAt!: Date | null;
  @ApiProperty({ enum: RejectionReason, nullable: true })
  rejectionReason!: RejectionReason | null;
}

export class WorkflowSummaryDto {
  @ApiProperty({ format: 'uuid' }) vacancyId!: string;
  @ApiProperty() stageCount!: number;
  @ApiProperty() completedCount!: number;
  @ApiProperty({ description: 'Any stage was cancelled' }) rejected!: boolean;
  @ApiProperty({ description: 'The offer stage is completed' })
  offered!: boolean;
  @ApiPropertyOptional({
    type: StageBriefDto,
    nullable: true,
    description: 'First stage that is not finished yet'
  })
  currentStage!: StageBriefDto | null;
  @ApiPropertyOptional({
    type: StageBriefDto,
    nullable: true,
    description:
      'Furthest stage the candidate has reached (any status except not started or skipped)'
  })
  reachedStage!: StageBriefDto | null;
}
