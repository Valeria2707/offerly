import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { NOTE_CONTENT_PATTERN } from '../notes.constants';

export class SaveStageNoteDto {
  @ApiProperty({
    example: 'Ask about the team structure and onboarding process.',
    maxLength: 10000
  })
  @IsString()
  @Length(1, 10000)
  @Matches(NOTE_CONTENT_PATTERN)
  content!: string;
}

export class StageNoteResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() stageId!: string;
  @ApiProperty() content!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
