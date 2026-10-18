import {
  Body,
  Controller,
  Get,
  Header,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import { CalendarService } from './calendar.service';
import {
  CalendarEventDto,
  CalendarQueryDto,
  CalendarSubscriptionQueryDto,
  ReminderDto,
  ReminderSettingsDto,
  UpdateReminderSettingsDto
} from './dto/calendar.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(readonly service: CalendarService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Stages with a date inside the requested window' })
  @ApiOkResponse({ type: [CalendarEventDto] })
  events(
    @Req() req: AuthenticatedRequest,
    @Query() query: CalendarQueryDto
  ): Promise<CalendarEventDto[]> {
    return this.service.events(req.user.sub, query.from, query.to);
  }

  @Get('reminders')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'What needs attention today, by the active rules' })
  @ApiOkResponse({ type: [ReminderDto] })
  reminders(@Req() req: AuthenticatedRequest): Promise<ReminderDto[]> {
    return this.service.reminders(req.user.sub);
  }

  @Get('settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reminder rules of the current user' })
  @ApiOkResponse({ type: ReminderSettingsDto })
  settings(@Req() req: AuthenticatedRequest): Promise<ReminderSettingsDto> {
    return this.service.settings(req.user.sub);
  }

  @Patch('settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change reminder rules, quiet hours or email' })
  @ApiOkResponse({ type: ReminderSettingsDto })
  update(
    @Req() req: AuthenticatedRequest,
    @Body() input: UpdateReminderSettingsDto
  ): Promise<ReminderSettingsDto> {
    return this.service.update(req.user.sub, input);
  }

  @Post('subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Issue a personal subscription token, once' })
  @ApiOkResponse({ type: ReminderSettingsDto })
  subscribe(@Req() req: AuthenticatedRequest): Promise<ReminderSettingsDto> {
    return this.service.subscribe(req.user.sub);
  }

  @Get('subscription.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @ApiOperation({ summary: 'iCalendar feed for a personal token' })
  @ApiOkResponse({ description: 'iCalendar document' })
  @ApiNotFoundResponse({ description: 'Unknown token' })
  feed(@Query() query: CalendarSubscriptionQueryDto): Promise<string> {
    return this.service.calendarByToken(query.token);
  }
}
