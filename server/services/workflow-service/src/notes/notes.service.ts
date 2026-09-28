import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowService } from '../workflow/workflow.service';
import { SaveStageNoteDto } from './dto/stage-note.dto';
import { StageNote } from './entities/stage-note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(StageNote) public notes: Repository<StageNote>,
    public workflows: WorkflowService
  ) {}

  async list(
    userId: string,
    workflowId: string,
    stageId: string
  ): Promise<StageNote[]> {
    await this.workflows.requireStage(userId, workflowId, stageId);
    return this.notes.find({
      where: { stageId },
      order: { createdAt: 'ASC', id: 'ASC' }
    });
  }

  async create(
    userId: string,
    workflowId: string,
    stageId: string,
    input: SaveStageNoteDto
  ): Promise<StageNote> {
    await this.workflows.requireStage(userId, workflowId, stageId);
    return this.notes.save(
      this.notes.create({ stageId, content: input.content.trim() })
    );
  }

  async update(
    userId: string,
    workflowId: string,
    stageId: string,
    noteId: string,
    input: SaveStageNoteDto
  ): Promise<StageNote> {
    await this.workflows.requireStage(userId, workflowId, stageId);
    const note = await this.notes.findOneBy({ id: noteId, stageId });
    if (!note) throw new NotFoundException('Stage note not found');
    note.content = input.content.trim();
    return this.notes.save(note);
  }

  async remove(
    userId: string,
    workflowId: string,
    stageId: string,
    noteId: string
  ): Promise<void> {
    await this.workflows.requireStage(userId, workflowId, stageId);
    const result = await this.notes.delete({ id: noteId, stageId });
    if (!result.affected) throw new NotFoundException('Stage note not found');
  }
}
