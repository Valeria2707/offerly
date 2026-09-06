import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { VacancyStatus } from '../enums/vacancy-status.enum';

export class VacancyDraftDto {
  @ApiProperty() @IsString() @Length(1, 300) @Matches(/\S/) title!: string;
  @ApiProperty() @IsString() @Length(1, 300) @Matches(/\S/) company!: string;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  workFormat?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  employmentType?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  level?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  salaryRange?: string | null;
  @ApiPropertyOptional({ nullable: true, example: '2026-08-14' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  postedAt?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  description?: string | null;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  requiredSkills?: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  preferredSkills?: string[];
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  experienceRequirement?: string | null;
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  educationRequirement?: string | null;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  languageRequirements?: string[];
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  sourceUrl?: string | null;
}

export class UpdateVacancyDto extends PartialType(VacancyDraftDto) {
  @ApiPropertyOptional({ enum: VacancyStatus })
  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  nextStep?: string | null;
}

export class ImportVacancyUrlDto {
  @ApiProperty({ example: 'https://company.example/jobs/backend-engineer' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  url!: string;
}

export class ImportVacancyTextDto {
  @ApiProperty({
    description: 'Full vacancy posting copied by the user',
    minLength: 100,
    maxLength: 100000
  })
  @IsString()
  @Length(100, 100_000)
  @Matches(/\S/)
  text!: string;
}

export class ApplyVacancyImportDto {
  @ApiPropertyOptional({
    type: VacancyDraftDto,
    description: 'Edited draft. Omit to save the original AI draft unchanged.'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VacancyDraftDto)
  draft?: VacancyDraftDto;
}

export class VacancyResponseDto extends VacancyDraftDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: VacancyStatus }) status!: VacancyStatus;
  @ApiProperty({ nullable: true }) nextStep!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class VacancyImportResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true }) sourceUrl!: string | null;
  @ApiProperty({ type: VacancyDraftDto }) draft!: VacancyDraftDto;
  @ApiProperty({ nullable: true }) appliedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
}
