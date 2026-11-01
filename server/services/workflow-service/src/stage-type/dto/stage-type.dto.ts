import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min
} from 'class-validator';
import { StageCategory } from '../../workflow/workflow.enums';
export class CreateStageTypeDto {
  @ApiProperty() @IsString() @Length(1, 200) name!: string;
  @ApiProperty({ enum: StageCategory })
  @IsEnum(StageCategory)
  category!: StageCategory;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  expectedDurationMinutes?: number | null;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresPreparation?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportsDeadline?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() producesArtifact?: boolean;
}
export class UpdateStageTypeDto extends PartialType(CreateStageTypeDto) {}

export class StageTypeResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Null for system stage types'
  })
  ownerUserId!: string | null;
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Catalog code of a system type; null for personal types'
  })
  code!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: StageCategory }) category!: StageCategory;
  @ApiProperty({ type: Number, nullable: true })
  expectedDurationMinutes!: number | null;
  @ApiProperty() requiresPreparation!: boolean;
  @ApiProperty() supportsDeadline!: boolean;
  @ApiProperty() producesArtifact!: boolean;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
