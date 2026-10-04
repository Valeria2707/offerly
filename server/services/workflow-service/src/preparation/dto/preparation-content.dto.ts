import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import {
  COVER_LETTER_MAX_LENGTH,
  LIST_ITEM_MAX_LENGTH,
  TERM_MAX_LENGTH,
  TEXT_MAX_LENGTH,
  USER_ANSWER_MAX_LENGTH
} from '../preparation.constants';

export class QuestionAnswerItem {
  @ApiProperty() @IsString() @Matches(/\S/) id!: string;
  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  @MaxLength(TEXT_MAX_LENGTH)
  question!: string;
  @ApiProperty() @IsString() @MaxLength(TEXT_MAX_LENGTH) tips!: string;
  @ApiProperty()
  @IsString()
  @MaxLength(TEXT_MAX_LENGTH)
  expectedAnswer!: string;
  @ApiPropertyOptional()
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(USER_ANSWER_MAX_LENGTH)
  userAnswer?: string;
}
export class CodingTask {
  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  @MaxLength(TEXT_MAX_LENGTH)
  task!: string;
  @ApiProperty() @IsString() @MaxLength(TEXT_MAX_LENGTH) hint!: string;
}
export class CvCoverLetterContent {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(LIST_ITEM_MAX_LENGTH, { each: true })
  cvTips!: string[];
  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  @MaxLength(COVER_LETTER_MAX_LENGTH)
  coverLetterDraft!: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(TERM_MAX_LENGTH, { each: true })
  tailoredKeywords!: string[];
}
export class HrScreeningContent {
  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  @MaxLength(TEXT_MAX_LENGTH)
  elevatorPitch!: string;
  @ApiProperty({ type: [QuestionAnswerItem] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerItem)
  commonQuestions!: QuestionAnswerItem[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(LIST_ITEM_MAX_LENGTH, { each: true })
  questionsToAskInterviewer!: string[];
}
export class TechnicalContent {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(TERM_MAX_LENGTH, { each: true })
  targetStack!: string[];
  @ApiProperty({ type: [QuestionAnswerItem] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerItem)
  theoreticalQuestions!: QuestionAnswerItem[];
  @ApiProperty({ type: [CodingTask] })
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CodingTask)
  codingTasks!: CodingTask[];
}
export class CustomContent {
  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  @MaxLength(TEXT_MAX_LENGTH)
  instructions!: string;
  @ApiProperty({ type: [QuestionAnswerItem] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerItem)
  items!: QuestionAnswerItem[];
}
