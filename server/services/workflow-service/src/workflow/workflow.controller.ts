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
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import {
  WorkflowSummaryDto,
  WorkflowSummaryQueryDto
} from './dto/workflow-summary.dto';
import {
  AddStageDto,
  ReorderStagesDto,
  StageNoteDto,
  StageQuestionDto,
  UpdateStageDto
} from './dto/workflow.dto';
import { WorkflowService } from './workflow.service';
import { ApplicationWorkflow } from './entities/application-workflow.entity';
import { StageNote } from './entities/stage-note.entity';
import { StageQuestion } from './entities/stage-question.entity';
import { WorkflowStage } from './entities/workflow-stage.entity';
@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(readonly service: WorkflowService) {}
  @Get('summary')
  @ApiOperation({
    summary: 'Current stage of many vacancies at once, for the vacancy list'
  })
  @ApiOkResponse({ type: [WorkflowSummaryDto] })
  summary(
    @Req() req: AuthenticatedRequest,
    @Query() query: WorkflowSummaryQueryDto
  ): Promise<WorkflowSummaryDto[]> {
    return this.service.summaries(req.user.sub, query.vacancyIds);
  }

  @Get('vacancies/:vacancyId')
  @ApiOperation({ summary: 'Get the workflow owned by the current user' })
  @ApiOkResponse({ type: ApplicationWorkflow })
  get(
    @Req() req: AuthenticatedRequest,
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string
  ): Promise<ApplicationWorkflow> {
    return this.service.getByVacancy(req.user.sub, vacancyId);
  }
  @Post(':workflowId/stages')
  @ApiOperation({ summary: 'Add a stage from the catalog' })
  @ApiCreatedResponse({ type: WorkflowStage })
  add(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Body() input: AddStageDto
  ): Promise<WorkflowStage> {
    return this.service.addStage(req.user.sub, workflowId, input);
  }
  @Patch(':workflowId/stages/:stageId')
  @ApiOperation({ summary: 'Update stage state or scheduling' })
  @ApiOkResponse({ type: WorkflowStage })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() input: UpdateStageDto
  ): Promise<WorkflowStage> {
    return this.service.updateStage(req.user.sub, workflowId, stageId, input);
  }
  @Delete(':workflowId/stages/:stageId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a stage' })
  @ApiNoContentResponse()
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<void> {
    return this.service.removeStage(req.user.sub, workflowId, stageId);
  }
  @Put(':workflowId/stages/order')
  @ApiOperation({ summary: 'Reorder stages; IDs in one group run in parallel' })
  @ApiOkResponse({ type: ApplicationWorkflow })
  order(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Body() input: ReorderStagesDto
  ): Promise<ApplicationWorkflow> {
    return this.service.reorder(req.user.sub, workflowId, input);
  }
  @Post(':workflowId/stages/:stageId/questions')
  @ApiOperation({ summary: 'Record a question the candidate was asked' })
  @ApiCreatedResponse({ type: StageQuestion })
  @ApiNotFoundResponse({ description: 'Workflow or stage not found' })
  addQuestion(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() input: StageQuestionDto
  ): Promise<StageQuestion> {
    return this.service.addQuestion(req.user.sub, workflowId, stageId, input);
  }
  @Patch(':workflowId/stages/:stageId/questions/:questionId')
  @ApiOperation({ summary: 'Edit a recorded question' })
  @ApiOkResponse({ type: StageQuestion })
  @ApiNotFoundResponse({
    description: 'Workflow, stage or question not found'
  })
  updateQuestion(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() input: StageQuestionDto
  ): Promise<StageQuestion> {
    return this.service.updateQuestion(
      req.user.sub,
      workflowId,
      stageId,
      questionId,
      input
    );
  }
  @Delete(':workflowId/stages/:stageId/questions/:questionId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a recorded question' })
  @ApiNoContentResponse()
  removeQuestion(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string
  ): Promise<void> {
    return this.service.removeQuestion(
      req.user.sub,
      workflowId,
      stageId,
      questionId
    );
  }
  @Post(':workflowId/stages/:stageId/notes')
  @ApiOperation({ summary: 'Add a note to a workflow stage' })
  @ApiCreatedResponse({ type: StageNote })
  @ApiNotFoundResponse({ description: 'Workflow or stage not found' })
  addNote(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() input: StageNoteDto
  ): Promise<StageNote> {
    return this.service.addNote(req.user.sub, workflowId, stageId, input);
  }
  @Patch(':workflowId/stages/:stageId/notes/:noteId')
  @ApiOperation({ summary: 'Edit a stage note' })
  @ApiOkResponse({ type: StageNote })
  @ApiNotFoundResponse({ description: 'Workflow, stage or note not found' })
  updateNote(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() input: StageNoteDto
  ): Promise<StageNote> {
    return this.service.updateNote(
      req.user.sub,
      workflowId,
      stageId,
      noteId,
      input
    );
  }
  @Delete(':workflowId/stages/:stageId/notes/:noteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a stage note' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Workflow, stage or note not found' })
  removeNote(
    @Req() req: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string
  ): Promise<void> {
    return this.service.removeNote(req.user.sub, workflowId, stageId, noteId);
  }
}
