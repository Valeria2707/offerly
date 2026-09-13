import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';
import { StageStatus } from '../workflow.enums';
export class AddStageDto {
  @ApiProperty() @IsUUID() stageTypeId!: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) position?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
}
export class UpdateStageDto {
  @ApiPropertyOptional({ enum: StageStatus })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?:
    string | null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadlineAt?:
    string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) note?:
    string | null;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  artifactUrl?: string | null;
}
export class StageGroupDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  stageIds!: string[];
}
export class ReorderStagesDto {
  @ApiProperty({ type: [StageGroupDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StageGroupDto)
  groups!: StageGroupDto[];
}
