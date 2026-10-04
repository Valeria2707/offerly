import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath
} from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  ValidateIf
} from 'class-validator';
import {
  INSTRUCTIONS_MAX_LENGTH,
  USER_ANSWER_MAX_LENGTH
} from '../preparation.constants';
import { PreparationType } from '../preparation.enums';
import { PreparationData } from '../preparation.types';
import {
  CustomContent,
  CvCoverLetterContent,
  HrScreeningContent,
  TechnicalContent
} from './preparation-content.dto';
export class GeneratePreparationDto {
  @ApiPropertyOptional({
    enum: PreparationType,
    description: 'Optional format override for personal stage types'
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(PreparationType)
  type?: PreparationType;
  @ApiPropertyOptional({
    maxLength: INSTRUCTIONS_MAX_LENGTH,
    description:
      'Required for personal stage types; optional extra context for system stages'
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  @MaxLength(INSTRUCTIONS_MAX_LENGTH)
  instructions?: string;
}
export class UpdateAnswerDto {
  @ApiProperty({
    maxLength: USER_ANSWER_MAX_LENGTH,
    description: 'Use an empty string to clear an answer'
  })
  @IsString()
  @MaxLength(USER_ANSWER_MAX_LENGTH)
  userAnswer!: string;
}
export class PreparationResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) stageId!: string;
  @ApiProperty({
    oneOf: [
      {
        type: 'object',
        required: ['type', 'content'],
        properties: {
          type: { type: 'string', enum: [PreparationType.CV_COVER_LETTER] },
          content: { $ref: getSchemaPath(CvCoverLetterContent) }
        }
      },
      {
        type: 'object',
        required: ['type', 'content'],
        properties: {
          type: { type: 'string', enum: [PreparationType.HR_SCREENING] },
          content: { $ref: getSchemaPath(HrScreeningContent) }
        }
      },
      {
        type: 'object',
        required: ['type', 'content'],
        properties: {
          type: { type: 'string', enum: [PreparationType.TECHNICAL] },
          content: { $ref: getSchemaPath(TechnicalContent) }
        }
      },
      {
        type: 'object',
        required: ['type', 'content'],
        properties: {
          type: { type: 'string', enum: [PreparationType.CUSTOM] },
          content: { $ref: getSchemaPath(CustomContent) }
        }
      }
    ]
  })
  data!: PreparationData;
  @ApiProperty({ nullable: true, type: String }) instructions!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
