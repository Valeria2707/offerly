import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import {
  PreparationResponseDto,
  RevisePreparationDto
} from './dto/preparation.dto';
import { PreparationService } from './preparation.service';

@ApiTags('stage-preparation')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing, expired or invalid access token'
})
@ApiForbiddenResponse({ description: 'Workflow belongs to another user' })
@ApiNotFoundResponse({
  description: 'Workflow, stage or preparation not found'
})
@ApiBadRequestResponse({
  description: 'Invalid request or unsupported stage type'
})
@UseGuards(JwtAuthGuard)
@Controller('workflows/:workflowId/stages/:stageId/preparation')
export class PreparationController {
  constructor(public service: PreparationService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'On first HR-stage opening, generate CV and cover letter; return existing preparation on subsequent requests'
  })
  @ApiOkResponse({ type: PreparationResponseDto })
  @ApiServiceUnavailableResponse({
    description: 'AI or source services unavailable or AI not configured'
  })
  @ApiUnprocessableEntityResponse({
    description: 'Profile is empty, context too large or AI output invalid'
  })
  generate(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<PreparationResponseDto> {
    const authorization = request.headers.authorization;
    if (!authorization)
      throw new UnauthorizedException('Authorization header is missing');
    return this.service.generate(
      request.user.sub,
      workflowId,
      stageId,
      authorization
    );
  }

  @Get()
  @ApiOperation({ summary: 'Read current HR preparation without generating' })
  @ApiOkResponse({ type: PreparationResponseDto })
  latest(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<PreparationResponseDto> {
    return this.service.latest(request.user.sub, workflowId, stageId);
  }

  @Get('versions')
  @ApiOperation({
    summary: 'Read HR preparation version history, newest first'
  })
  @ApiOkResponse({ type: [PreparationResponseDto] })
  history(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<PreparationResponseDto[]> {
    return this.service.history(request.user.sub, workflowId, stageId);
  }

  @Post('revisions')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Revise CV, cover letter or both using a user prompt'
  })
  @ApiOkResponse({ type: PreparationResponseDto })
  @ApiConflictResponse({
    description: 'baseVersion is stale; reload current preparation'
  })
  @ApiServiceUnavailableResponse({
    description: 'AI unavailable or not configured'
  })
  @ApiUnprocessableEntityResponse({ description: 'AI output invalid' })
  revise(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() input: RevisePreparationDto
  ): Promise<PreparationResponseDto> {
    return this.service.revise(request.user.sub, workflowId, stageId, input);
  }
}
