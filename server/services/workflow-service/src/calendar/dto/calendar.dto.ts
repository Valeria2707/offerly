import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength
} from 'class-validator';
import { StageCategory, StageStatus } from '../../workflow/workflow.enums';
import { TIME_PATTERN } from '../calendar.constants';
import { ReminderKind } from '../calendar.enums';

export class CalendarQueryDto {
  @ApiProperty({ description: 'Inclusive start of the window, ISO date' })
  @IsDateString()
  from!: string;
  @ApiProperty({ description: 'Exclusive end of the window, ISO date' })
  @IsDateString()
  to!: string;
}

export class CalendarEventDto {
  @ApiProperty({ format: 'uuid' }) stageId!: string;
  @ApiProperty({ format: 'uuid' }) vacancyId!: string;
  @ApiProperty({ format: 'uuid' }) workflowId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: StageCategory }) category!: StageCategory;
  @ApiProperty({ enum: StageStatus }) status!: StageStatus;
  @ApiProperty({ nullable: true, type: Date }) scheduledAt!: Date | null;
  @ApiProperty({ nullable: true, type: Date }) deadlineAt!: Date | null;
}

export class ReminderDto extends CalendarEventDto {
  @ApiProperty({ enum: ReminderKind }) kind!: ReminderKind;
  @ApiProperty({
    description:
      'Whole days between today and the event; negative when it is overdue'
  })
  days!: number;
}

export class ReminderSettingsDto {
  @ApiProperty() emailEnabled!: boolean;
  @ApiProperty() beforeInterview!: boolean;
  @ApiProperty() afterStage!: boolean;
  @ApiProperty() beforeDeadline!: boolean;
  @ApiProperty() silence!: boolean;
  @ApiProperty() weeklyDigest!: boolean;
  @ApiProperty({ example: '22:00' }) quietFrom!: string;
  @ApiProperty({ example: '08:00' }) quietTo!: string;
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Subscription token, null until the user asks for one'
  })
  calendarToken!: string | null;
}

export class UpdateReminderSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() beforeInterview?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() afterStage?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() beforeDeadline?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() silence?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() weeklyDigest?: boolean;
  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'quietFrom must be HH:mm' })
  quietFrom?: string;
  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'quietTo must be HH:mm' })
  quietTo?: string;
}

export class CalendarSubscriptionQueryDto {
  @ApiProperty({ description: 'Personal subscription token' })
  @IsString()
  @MaxLength(64)
  token!: string;
}
