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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import { SaveStageNoteDto, StageNoteResponseDto } from './dto/stage-note.dto';
import { NotesService } from './notes.service';

@ApiTags('stage-notes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
@ApiForbiddenResponse({ description: 'Workflow belongs to another user' })
@ApiNotFoundResponse({ description: 'Workflow, stage or note not found' })
@ApiBadRequestResponse({ description: 'Invalid UUID or note content' })
@UseGuards(JwtAuthGuard)
@Controller('workflows/:workflowId/stages/:stageId/notes')
export class NotesController {
  constructor(public service: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List notes for any standard or custom stage' })
  @ApiOkResponse({ type: [StageNoteResponseDto] })
  list(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string
  ): Promise<StageNoteResponseDto[]> {
    return this.service.list(request.user.sub, workflowId, stageId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a note to a stage' })
  @ApiCreatedResponse({ type: StageNoteResponseDto })
  create(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() input: SaveStageNoteDto
  ): Promise<StageNoteResponseDto> {
    return this.service.create(request.user.sub, workflowId, stageId, input);
  }

  @Patch(':noteId')
  @ApiOperation({ summary: 'Edit a stage note' })
  @ApiOkResponse({ type: StageNoteResponseDto })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() input: SaveStageNoteDto
  ): Promise<StageNoteResponseDto> {
    return this.service.update(
      request.user.sub,
      workflowId,
      stageId,
      noteId,
      input
    );
  }

  @Delete(':noteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a stage note' })
  @ApiNoContentResponse()
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('workflowId', ParseUUIDPipe) workflowId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string
  ): Promise<void> {
    return this.service.remove(request.user.sub, workflowId, stageId, noteId);
  }
}
