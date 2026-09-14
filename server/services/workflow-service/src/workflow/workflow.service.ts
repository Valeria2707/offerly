import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { StageType } from '../stage-type/entities/stage-type.entity';
import { isCompleteStageOrder } from '../utils/workflow-order.utils';
import {
  AddStageDto,
  ReorderStagesDto,
  UpdateStageDto
} from './dto/workflow.dto';
import { ApplicationWorkflow } from './entities/application-workflow.entity';
import { WorkflowStage } from './entities/workflow-stage.entity';
import { StageStatus } from './workflow.enums';
const DEFAULT_STAGE_CODES = [
  'submitted',
  'hr_screening',
  'technical_interview',
  'final_interview',
  'offer'
];
@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(ApplicationWorkflow)
    readonly workflows: Repository<ApplicationWorkflow>,
    @InjectRepository(WorkflowStage)
    readonly stages: Repository<WorkflowStage>,
    @InjectRepository(StageType) readonly types: Repository<StageType>,
    readonly dataSource: DataSource
  ) {}
  async createDefault(vacancyId: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (await manager.existsBy(ApplicationWorkflow, { vacancyId })) return;
      const workflow = await manager.save(
        ApplicationWorkflow,
        manager.create(ApplicationWorkflow, { vacancyId, userId })
      );
      const types = await manager.findBy(StageType, {
        code: In(DEFAULT_STAGE_CODES)
      });
      const byCode = new Map(types.map((type) => [type.code, type]));
      if (DEFAULT_STAGE_CODES.some((code) => !byCode.has(code)))
        throw new Error('Default stage type catalog is incomplete');
      await manager.save(
        WorkflowStage,
        DEFAULT_STAGE_CODES.map((code, index) => {
          const type = byCode.get(code);
          if (!type) throw new Error(`Missing stage type ${code}`);
          return manager.create(WorkflowStage, {
            workflowId: workflow.id,
            stageTypeId: type.id,
            name: type.name,
            category: type.category,
            position: index + 1,
            isRequired: true,
            status:
              index === 0 ? StageStatus.COMPLETED : StageStatus.NOT_STARTED,
            completedAt: index === 0 ? new Date() : null,
            scheduledAt: null,
            deadlineAt: null,
            note: null,
            artifactUrl: null
          });
        })
      );
    });
  }
  async getByVacancy(
    userId: string,
    vacancyId: string
  ): Promise<ApplicationWorkflow> {
    await this.createDefault(vacancyId, userId);
    const workflow = await this.workflows.findOne({
      where: { vacancyId, userId },
      relations: { stages: true },
      order: { stages: { position: 'ASC', createdAt: 'ASC' } }
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
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
        note: null,
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
    await this.requireWorkflow(userId, workflowId);
    const stage = await this.stages.findOneBy({ id: stageId, workflowId });
    if (!stage) throw new NotFoundException('Workflow stage not found');
    Object.assign(stage, input, {
      scheduledAt:
        input.scheduledAt === undefined
          ? stage.scheduledAt
          : input.scheduledAt
            ? new Date(input.scheduledAt)
            : null,
      deadlineAt:
        input.deadlineAt === undefined
          ? stage.deadlineAt
          : input.deadlineAt
            ? new Date(input.deadlineAt)
            : null
    });
    if (input.status === StageStatus.COMPLETED && !stage.completedAt)
      stage.completedAt = new Date();
    if (input.status && input.status !== StageStatus.COMPLETED)
      stage.completedAt = null;
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
  async requireWorkflow(
    userId: string,
    id: string
  ): Promise<ApplicationWorkflow> {
    const workflow = await this.workflows.findOneBy({ id });
    if (!workflow) throw new NotFoundException('Workflow not found');
    if (workflow.userId !== userId)
      throw new ForbiddenException('Workflow does not belong to user');
    return workflow;
  }
  async getById(userId: string, id: string): Promise<ApplicationWorkflow> {
    await this.requireWorkflow(userId, id);
    const workflow = await this.workflows.findOne({
      where: { id, userId },
      relations: { stages: true },
      order: { stages: { position: 'ASC', createdAt: 'ASC' } }
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }
}
