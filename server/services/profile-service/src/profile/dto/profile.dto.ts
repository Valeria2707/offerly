import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CvImportStatus } from '../enums/cv-import-status.enum';
import { ProfileData } from '../profile.types';
import { normalizeUrlValue } from '../../utils/url.utils';
import { OptionalText } from './optional-text.decorator';

export class ProfileLinkDto {
  @ApiProperty({ example: 'LinkedIn' })
  @IsString()
  @MaxLength(50)
  label!: string;

  @ApiProperty({ example: 'https://linkedin.com/in/example' })
  @Transform(normalizeUrlValue)
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  url!: string;
}

export class ProfileBasicsDto {
  @OptionalText(150)
  fullName?: string | null;
  @OptionalText(200)
  headline?: string | null;
  @OptionalText(255)
  email?: string | null;
  @OptionalText(50)
  phone?: string | null;
  @OptionalText(200)
  location?: string | null;
  @OptionalText(5000)
  summary?: string | null;

  @ApiPropertyOptional({ type: [ProfileLinkDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProfileLinkDto)
  links?: ProfileLinkDto[];
}

export class ProfilePreferencesDto {
  @OptionalText(200)
  desiredPosition?: string | null;
  @OptionalText(100)
  level?: string | null;
  @OptionalText(100)
  workFormat?: string | null;
  @OptionalText(100)
  expectedSalary?: string | null;
}

export class ProfileSkillDto {
  @ApiProperty() @IsString() @MaxLength(100) name!: string;
  @OptionalText(50)
  level!: string | null;
}

export class ProfileExperienceDto {
  @ApiProperty() @IsString() @MaxLength(200) company!: string;
  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @OptionalText(10)
  startDate!: string | null;
  @OptionalText(10)
  endDate!: string | null;
  @ApiProperty() @IsBoolean() current!: boolean;
  @OptionalText(200)
  location!: string | null;
  @OptionalText(5000)
  description!: string | null;
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  highlights!: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  skills!: string[];
}

export class ProfileEducationDto {
  @ApiProperty() @IsString() @MaxLength(200) institution!: string;
  @OptionalText(200)
  degree!: string | null;
  @OptionalText(200)
  field!: string | null;
  @OptionalText(10)
  startDate!: string | null;
  @OptionalText(10)
  endDate!: string | null;
  @OptionalText(5000)
  description!: string | null;
}

export class ProfileProjectDto {
  @ApiProperty() @IsString() @MaxLength(200) name!: string;
  @OptionalText(5000)
  description!: string | null;
  @ApiPropertyOptional({ nullable: true })
  @Transform(normalizeUrlValue)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  url!: string | null;
  @OptionalText(10)
  startDate!: string | null;
  @OptionalText(10)
  endDate!: string | null;
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  highlights!: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  skills!: string[];
}

export class ProfileLanguageDto {
  @ApiProperty() @IsString() @MaxLength(100) name!: string;
  @OptionalText(100)
  level!: string | null;
}

export class ProfileDataDto {
  @ApiProperty({ type: ProfileBasicsDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => ProfileBasicsDto)
  basics!: ProfileBasicsDto;
  @ApiProperty({ type: ProfilePreferencesDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => ProfilePreferencesDto)
  preferences!: ProfilePreferencesDto;
  @ApiProperty({ type: [ProfileSkillDto] })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ProfileSkillDto)
  skills!: ProfileSkillDto[];
  @ApiProperty({ type: [ProfileExperienceDto] })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProfileExperienceDto)
  experience!: ProfileExperienceDto[];
  @ApiProperty({ type: [ProfileEducationDto] })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ProfileEducationDto)
  education!: ProfileEducationDto[];
  @ApiProperty({ type: [ProfileProjectDto] })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProfileProjectDto)
  projects!: ProfileProjectDto[];
  @ApiProperty({ type: [ProfileLanguageDto] })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ProfileLanguageDto)
  languages!: ProfileLanguageDto[];
}

export class UpdateProfileDto extends PartialType(ProfileDataDto) {}

export class ApplyCvImportDto {
  @ApiPropertyOptional({
    type: ProfileDataDto,
    description:
      'Reviewed data. When omitted, the extracted draft is merged into the profile.'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDataDto)
  data?: ProfileDataDto;
}

export class ProfileResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty({ type: ProfileDataDto }) data!: ProfileData;
  @ApiProperty() version!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class CvImportResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: CvImportStatus }) status!: CvImportStatus;
  @ApiProperty() originalFilename!: string;
  @ApiProperty({ type: ProfileDataDto, nullable: true })
  draftData!: ProfileData | null;
  @ApiProperty({ nullable: true }) modelName!: string | null;
  @ApiProperty() schemaVersion!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
