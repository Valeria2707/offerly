import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';
import {
  MAX_VACANCY_TEXT_LENGTH,
  MIN_VACANCY_TEXT_LENGTH
} from '../../import/import.constants';
import { VacancyLifecycle } from '../enums/vacancy-lifecycle.enum';
import {
  RECRUITER_EMAIL_MAX_LENGTH,
  RECRUITER_NAME_MAX_LENGTH,
  RECRUITER_PHONE_MAX_LENGTH,
  URL_MAX_LENGTH,
  VACANCY_COMPANY_MAX_LENGTH,
  VACANCY_TITLE_MAX_LENGTH
} from '../vacancy.constants';

export class VacancyDraftDto {
  @ApiProperty({ maxLength: VACANCY_TITLE_MAX_LENGTH })
  @IsString()
  @Length(1, VACANCY_TITLE_MAX_LENGTH)
  @Matches(/\S/)
  title!: string;
  @ApiProperty({ maxLength: VACANCY_COMPANY_MAX_LENGTH })
  @IsString()
  @Length(1, VACANCY_COMPANY_MAX_LENGTH)
  @Matches(/\S/)
  company!: string;
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
  @MaxLength(URL_MAX_LENGTH)
  sourceUrl?: string | null;
}

export class RecruiterContactDto {
  @ApiPropertyOptional({ nullable: true, maxLength: RECRUITER_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(RECRUITER_NAME_MAX_LENGTH)
  recruiterName?: string | null;
  @ApiPropertyOptional({
    nullable: true,
    maxLength: RECRUITER_EMAIL_MAX_LENGTH
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(RECRUITER_EMAIL_MAX_LENGTH)
  recruiterEmail?: string | null;
  @ApiPropertyOptional({
    nullable: true,
    maxLength: RECRUITER_PHONE_MAX_LENGTH
  })
  @IsOptional()
  @IsString()
  @MaxLength(RECRUITER_PHONE_MAX_LENGTH)
  recruiterPhone?: string | null;
  @ApiPropertyOptional({
    nullable: true,
    description: 'LinkedIn, Telegram or any other profile link'
  })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(URL_MAX_LENGTH)
  recruiterUrl?: string | null;
}

export class OfferDetailsDto {
  @ApiPropertyOptional({
    nullable: true,
    minimum: 1,
    description: 'Offered salary'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  offerSalary?: number | null;
  @ApiPropertyOptional({
    nullable: true,
    minimum: 1,
    maximum: 5,
    description: 'Growth opportunities, 1–5'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  offerGrowth?: number | null;
  @ApiPropertyOptional({
    nullable: true,
    minimum: 1,
    maximum: 5,
    description: 'Work conditions: format, team, benefits, 1–5'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  offerConditions?: number | null;
}

export class UpdateVacancyDto extends IntersectionType(
  PartialType(VacancyDraftDto),
  RecruiterContactDto,
  OfferDetailsDto
) {
  @ApiPropertyOptional({ enum: VacancyLifecycle })
  @IsOptional()
  @IsEnum(VacancyLifecycle)
  lifecycle?: VacancyLifecycle;
}

export class ImportVacancyUrlDto {
  @ApiProperty({ example: 'https://company.example/jobs/backend-engineer' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(URL_MAX_LENGTH)
  url!: string;
}

export class ImportVacancyTextDto {
  @ApiProperty({
    description: 'Full vacancy posting copied by the user',
    minLength: MIN_VACANCY_TEXT_LENGTH,
    maxLength: MAX_VACANCY_TEXT_LENGTH
  })
  @IsString()
  @Length(MIN_VACANCY_TEXT_LENGTH, MAX_VACANCY_TEXT_LENGTH)
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

export class VacancyResponseDto extends IntersectionType(
  VacancyDraftDto,
  RecruiterContactDto,
  OfferDetailsDto
) {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: VacancyLifecycle }) lifecycle!: VacancyLifecycle;
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
