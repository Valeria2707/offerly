import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNoContentResponse,
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
  CodingTask,
  CustomContent,
  CvCoverLetterContent,
  HrScreeningContent,
  QuestionAnswerItem,
  TechnicalContent
} from './dto/preparation-content.dto';
import {
  GeneratePreparationDto,
  PreparationResponseDto,
  UpdateAnswerDto
} from './dto/preparation.dto';
import { PreparationService } from './preparation.service';
@ApiTags('stage-preparation')
@ApiBearerAuth()
@ApiExtraModels(
  CvCoverLetterContent,
  HrScreeningContent,
  TechnicalContent,
  CustomContent,
  QuestionAnswerItem,
  CodingTask
)
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
@ApiForbiddenResponse({ description: 'Workflow belongs to another user' })
@ApiNotFoundResponse({
  description: 'Workflow, stage, preparation or question not found'
})
@ApiBadRequestResponse({
  description: 'Invalid UUID, body or missing custom stage instructions'
})
@UseGuards(JwtAuthGuard)
@Controller('workflows/:workflowId/stages/:stageId/preparation')
export class PreparationController {
  constructor(private readonly service: PreparationService) {}
  @Get()
  @ApiOperation({ summary: 'Read saved stage preparation and user answers' })
  @ApiOkResponse({ type: PreparationResponseDto })
  get(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<PreparationResponseDto> {
    return this.service.get(req.user.sub, workflowId, stageId);
  }
  @Post()
  @ApiOperation({
    summary:
      'Generate and save stage preparation from the vacancy and user profile'
  })
  @ApiCreatedResponse({ type: PreparationResponseDto })
  @ApiConflictResponse({
    description: 'Preparation already exists; delete it before regenerating'
  })
  @ApiServiceUnavailableResponse({
    description: 'Context service or AI unavailable, or AI not configured'
  })
  @ApiUnprocessableEntityResponse({
    description: 'AI returned invalid content'
  })
  generate(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() input: GeneratePreparationDto
  ): Promise<PreparationResponseDto> {
    return this.service.generate(
      req.user.sub,
      workflowId,
      stageId,
      input,
      req.headers.authorization ?? ''
    );
  }
  @Patch('questions/:questionId')
  @ApiOperation({
    summary: 'Save or clear the user answer to a preparation question'
  })
  @ApiOkResponse({ type: PreparationResponseDto })
  answer(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() input: UpdateAnswerDto
  ): Promise<PreparationResponseDto> {
    return this.service.answer(
      req.user.sub,
      workflowId,
      stageId,
      questionId,
      input.userAnswer
    );
  }
  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Delete preparation including saved answers to allow fresh generation'
  })
  @ApiNoContentResponse()
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<void> {
    return this.service.remove(req.user.sub, workflowId, stageId);
  }
}
