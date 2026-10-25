import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import { AnalyticsService } from './analytics.service';
import { AnalyticsDto, AnalyticsQueryDto } from './dto/analytics.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(readonly service: AnalyticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Job search analytics of the current user for a period'
  })
  @ApiOkResponse({ type: AnalyticsDto })
  @ApiUnauthorizedResponse({ description: 'Token is missing or invalid' })
  @ApiServiceUnavailableResponse({
    description: 'Vacancy or profile service is unavailable'
  })
  overview(
    @Req() req: AuthenticatedRequest,
    @Query() query: AnalyticsQueryDto
  ): Promise<AnalyticsDto> {
    return this.service.overview(
      req.user.sub,
      req.headers.authorization ?? '',
      query.period ?? null
    );
  }
}
