import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, Length, Matches, Min } from 'class-validator';
import {
  MAX_DOCUMENT_CHARACTERS,
  NON_WHITESPACE_PATTERN
} from '../preparation.constants';
import { PreparationTarget } from '../preparation.enums';

export class HrDocumentsDto {
  @ApiProperty({ description: 'Tailored CV in Markdown' })
  @IsString()
  @Length(1, MAX_DOCUMENT_CHARACTERS)
  @Matches(NON_WHITESPACE_PATTERN)
  cv!: string;

  @ApiProperty({ description: 'Cover letter in Markdown' })
  @IsString()
  @Length(1, MAX_DOCUMENT_CHARACTERS)
  @Matches(NON_WHITESPACE_PATTERN)
  coverLetter!: string;
}

export class RevisePreparationDto {
  @ApiProperty({
    description: 'Version being edited; stale versions return 409',
    minimum: 1
  })
  @IsInt()
  @Min(1)
  baseVersion!: number;

  @ApiProperty({ enum: PreparationTarget })
  @IsEnum(PreparationTarget)
  target!: PreparationTarget;

  @ApiProperty({
    example: 'Make the summary shorter and emphasize my backend projects.'
  })
  @IsString()
  @Length(1, 5000)
  @Matches(NON_WHITESPACE_PATTERN)
  prompt!: string;
}

export class PreparationResponseDto extends HrDocumentsDto {
  @ApiProperty() id!: string;
  @ApiProperty() stageId!: string;
  @ApiProperty() version!: number;
  @ApiProperty({ nullable: true, type: String }) prompt!: string | null;
  @ApiProperty({ enum: PreparationTarget }) target!: PreparationTarget;
  @ApiProperty() createdAt!: Date;
}
