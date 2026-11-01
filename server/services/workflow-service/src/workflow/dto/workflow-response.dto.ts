import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RejectionReason, StageCategory, StageStatus } from '../workflow.enums';

export class StageNoteResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) stageId!: string;
  @ApiProperty() content!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class StageQuestionResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) stageId!: string;
  @ApiProperty() question!: string;
  @ApiProperty({ type: String, nullable: true }) answer!: string | null;
  @ApiProperty() wasHard!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class WorkflowStageResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) workflowId!: string;
  @ApiProperty({ format: 'uuid' }) stageTypeId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: StageCategory }) category!: StageCategory;
  @ApiProperty({ description: 'Stages with the same position run in parallel' })
  position!: number;
  @ApiProperty() isRequired!: boolean;
  @ApiProperty({ enum: StageStatus }) status!: StageStatus;
  @ApiProperty({ type: Date, nullable: true }) scheduledAt!: Date | null;
  @ApiProperty({ type: Date, nullable: true }) deadlineAt!: Date | null;
  @ApiProperty({ type: Date, nullable: true }) completedAt!: Date | null;
  @ApiProperty({ enum: RejectionReason, nullable: true })
  rejectionReason!: RejectionReason | null;
  @ApiProperty({ type: String, nullable: true }) artifactUrl!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional({
    type: [StageNoteResponseDto],
    description: 'Present when the whole workflow is returned'
  })
  notes?: StageNoteResponseDto[];
  @ApiPropertyOptional({
    type: [StageQuestionResponseDto],
    description: 'Present when the whole workflow is returned'
  })
  questions?: StageQuestionResponseDto[];
}

export class WorkflowResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) vacancyId!: string;
  @ApiProperty({ format: 'uuid' }) userId!: string;
  @ApiProperty({ type: [WorkflowStageResponseDto] })
  stages!: WorkflowStageResponseDto[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
