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
  AddStageDto,
  ReorderStagesDto,
  StageNoteDto,
  UpdateStageDto
} from './dto/workflow.dto';
import { WorkflowService } from './workflow.service';
import { ApplicationWorkflow } from './entities/application-workflow.entity';
import { StageNote } from './entities/stage-note.entity';
import { WorkflowStage } from './entities/workflow-stage.entity';
@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(readonly service: WorkflowService) {}
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
