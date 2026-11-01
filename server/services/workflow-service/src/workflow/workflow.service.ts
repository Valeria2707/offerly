import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUniqueViolation } from '@offerly/helpers';
import { DataSource, FindOptionsRelations, In, Not, Repository } from 'typeorm';
import { DEFAULT_STAGE_CODES } from '../stage-type/stage-type.constants';
import { StageType } from '../stage-type/entities/stage-type.entity';
import { UpstreamService } from '../upstream/upstream.service';
import { isCompleteStageOrder } from '../utils/workflow-order.utils';
import { applyStageUpdate } from '../utils/workflow-stage.utils';
import { toWorkflowSummary } from '../utils/workflow-summary.utils';
import { WorkflowSummaryDto } from './dto/workflow-summary.dto';
import {
  AddStageDto,
  ReorderStagesDto,
  StageNoteDto,
  StageQuestionDto,
  UpdateStageDto
} from './dto/workflow.dto';
import { ApplicationWorkflow } from './entities/application-workflow.entity';
import { StageNote } from './entities/stage-note.entity';
import { StageQuestion } from './entities/stage-question.entity';
import { WorkflowStage } from './entities/workflow-stage.entity';
import { StageStatus } from './workflow.enums';

const WORKFLOW_ORDER = {
  stages: { position: 'ASC', createdAt: 'ASC', notes: { createdAt: 'ASC' } }
} as const;
const WORKFLOW_RELATIONS = { stages: { notes: true, questions: true } };

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(ApplicationWorkflow)
    private readonly workflows: Repository<ApplicationWorkflow>,
    @InjectRepository(WorkflowStage)
    private readonly stages: Repository<WorkflowStage>,
    @InjectRepository(StageType) private readonly types: Repository<StageType>,
    @InjectRepository(StageNote) private readonly notes: Repository<StageNote>,
    @InjectRepository(StageQuestion)
    private readonly questions: Repository<StageQuestion>,
    private readonly dataSource: DataSource,
    private readonly upstream: UpstreamService
  ) {}

  /** Idempotent: the Kafka consumer and the first GET may run it at the same time. */
  async createDefault(vacancyId: string, userId: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        if (await manager.existsBy(ApplicationWorkflow, { vacancyId })) return;
        const types = await manager.findBy(StageType, {
          code: In(DEFAULT_STAGE_CODES)
        });
        const byCode = new Map(types.map((type) => [type.code, type]));
        const ordered = DEFAULT_STAGE_CODES.flatMap(
          (code) => byCode.get(code) ?? []
        );
        if (ordered.length !== DEFAULT_STAGE_CODES.length)
          throw new Error('Default stage type catalog is incomplete');
        const workflow = await manager.save(
          ApplicationWorkflow,
          manager.create(ApplicationWorkflow, { vacancyId, userId })
        );
        await manager.save(
          WorkflowStage,
          ordered.map((type, index) =>
            manager.create(WorkflowStage, {
              workflowId: workflow.id,
              stageTypeId: type.id,
              name: type.name,
              category: type.category,
              position: index + 1,
              isRequired: true,
              status:
                index === 0 ? StageStatus.IN_PROGRESS : StageStatus.NOT_STARTED,
              completedAt: null,
              scheduledAt: null,
              deadlineAt: null,
              artifactUrl: null
            })
          )
        );
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  async removeByVacancy(vacancyId: string, userId: string): Promise<void> {
    await this.workflows.delete({ vacancyId, userId });
  }

  async summaries(
    userId: string,
    vacancyIds: string[]
  ): Promise<WorkflowSummaryDto[]> {
    const workflows = await this.workflows.find({
      where: { userId, vacancyId: In(vacancyIds) },
      relations: { stages: { stageType: true } },
      order: WORKFLOW_ORDER
    });
    return workflows.map(toWorkflowSummary);
  }

  async getByVacancy(
    userId: string,
    vacancyId: string,
    authorization: string
  ): Promise<ApplicationWorkflow> {
    const existing = await this.findByVacancy(userId, vacancyId);
    if (existing) return existing;
    await this.upstream.vacancy(vacancyId, authorization);
    await this.createDefault(vacancyId, userId);
    const created = await this.findByVacancy(userId, vacancyId);
    if (!created) throw new NotFoundException('Workflow not found');
    return created;
  }

  async addStage(
    userId: string,
    workflowId: string,
    input: AddStageDto
  ): Promise<WorkflowStage> {
    await this.requireWorkflow(userId, workflowId);
    const type = await this.types
      .createQueryBuilder('type')
      .where('type.id=:id', { id: input.stageTypeId })
      .andWhere('type.isActive=true')
      .andWhere('(type.ownerUserId IS NULL OR type.ownerUserId=:userId)', {
        userId
      })
      .getOne();
    if (!type) throw new NotFoundException('Stage type not found');
    const max = await this.stages.maximum('position', { workflowId });
    return this.stages.save(
      this.stages.create({
        workflowId,
        stageTypeId: type.id,
        name: type.name,
        category: type.category,
        position: input.position ?? (max ?? 0) + 1,
        isRequired: input.isRequired ?? true,
        status: StageStatus.NOT_STARTED,
        scheduledAt: null,
        deadlineAt: null,
        completedAt: null,
        artifactUrl: null
      })
    );
  }

  async updateStage(
    userId: string,
    workflowId: string,
    stageId: string,
    input: UpdateStageDto
  ): Promise<WorkflowStage> {
    const stage = await this.requireStage(userId, workflowId, stageId);
    if (input.status && (await this.isRejectedElsewhere(workflowId, stageId)))
      throw new BadRequestException(
        'Vacancy was rejected: other stage statuses are frozen'
      );
    applyStageUpdate(stage, input);
    return this.stages.save(stage);
  }

  async removeStage(
    userId: string,
    workflowId: string,
    stageId: string
  ): Promise<void> {
    await this.requireWorkflow(userId, workflowId);
    const result = await this.stages.delete({ id: stageId, workflowId });
    if (!result.affected)
      throw new NotFoundException('Workflow stage not found');
  }

  async reorder(
    userId: string,
    workflowId: string,
    input: ReorderStagesDto
  ): Promise<ApplicationWorkflow> {
    await this.requireWorkflow(userId, workflowId);
    const existing = await this.stages.findBy({ workflowId });
    if (
      !isCompleteStageOrder(
        existing.map((stage) => stage.id),
        input.groups.map((group) => group.stageIds)
      )
    )
      throw new BadRequestException(
        'Order must contain every workflow stage exactly once'
      );
    await this.dataSource.transaction(async (manager) => {
      for (const [groupIndex, group] of input.groups.entries())
        await manager.update(
          WorkflowStage,
          { workflowId, id: In(group.stageIds) },
          { position: groupIndex + 1 }
        );
    });
    return this.getById(userId, workflowId);
  }

  async addQuestion(
    userId: string,
    workflowId: string,
    stageId: string,
    input: StageQuestionDto
  ): Promise<StageQuestion> {
    await this.requireStage(userId, workflowId, stageId);
    return this.questions.save(
      this.questions.create({
        stageId,
        question: input.question.trim(),
        answer: input.answer?.trim() || null,
        wasHard: input.wasHard ?? false
      })
    );
  }
  async updateQuestion(
    userId: string,
    workflowId: string,
    stageId: string,
    questionId: string,
    input: StageQuestionDto
  ): Promise<StageQuestion> {
    await this.requireStage(userId, workflowId, stageId);
    const question = await this.questions.findOneBy({
      id: questionId,
      stageId
    });
    if (!question) throw new NotFoundException('Stage question not found');
    question.question = input.question.trim();
    question.answer = input.answer?.trim() || null;
    question.wasHard = input.wasHard ?? false;
    return this.questions.save(question);
  }
  async removeQuestion(
    userId: string,
    workflowId: string,
    stageId: string,
    questionId: string
  ): Promise<void> {
    await this.requireStage(userId, workflowId, stageId);
    const result = await this.questions.delete({ id: questionId, stageId });
    if (!result.affected)
      throw new NotFoundException('Stage question not found');
  }
  async addNote(
    userId: string,
    workflowId: string,
    stageId: string,
    input: StageNoteDto
  ): Promise<StageNote> {
    await this.requireStage(userId, workflowId, stageId);
    return this.notes.save(
      this.notes.create({ stageId, content: input.content.trim() })
    );
  }
  async updateNote(
    userId: string,
    workflowId: string,
    stageId: string,
    noteId: string,
    input: StageNoteDto
  ): Promise<StageNote> {
    await this.requireStage(userId, workflowId, stageId);
    const note = await this.notes.findOneBy({ id: noteId, stageId });
    if (!note) throw new NotFoundException('Stage note not found');
    note.content = input.content.trim();
    return this.notes.save(note);
  }
  async removeNote(
    userId: string,
    workflowId: string,
    stageId: string,
    noteId: string
  ): Promise<void> {
    await this.requireStage(userId, workflowId, stageId);
    const result = await this.notes.delete({ id: noteId, stageId });
    if (!result.affected) throw new NotFoundException('Stage note not found');
  }

  async requireStage(
    userId: string,
    workflowId: string,
    stageId: string,
    relations: FindOptionsRelations<WorkflowStage> = {}
  ): Promise<WorkflowStage> {
    const stage = await this.stages.findOne({
      where: { id: stageId, workflowId, workflow: { userId } },
      relations
    });
    if (!stage) throw new NotFoundException('Workflow stage not found');
    return stage;
  }

  async requireWorkflow(
    userId: string,
    id: string
  ): Promise<ApplicationWorkflow> {
    const workflow = await this.workflows.findOneBy({ id, userId });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  async getById(userId: string, id: string): Promise<ApplicationWorkflow> {
    const workflow = await this.workflows.findOne({
      where: { id, userId },
      relations: WORKFLOW_RELATIONS,
      order: WORKFLOW_ORDER
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  private findByVacancy(
    userId: string,
    vacancyId: string
  ): Promise<ApplicationWorkflow | null> {
    return this.workflows.findOne({
      where: { vacancyId, userId },
      relations: WORKFLOW_RELATIONS,
      order: WORKFLOW_ORDER
    });
  }

  private isRejectedElsewhere(
    workflowId: string,
    stageId: string
  ): Promise<boolean> {
    return this.stages.existsBy({
      workflowId,
      id: Not(stageId),
      status: StageStatus.CANCELLED
    });
  }
}
