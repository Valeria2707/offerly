import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StageType } from '../stage-type/entities/stage-type.entity';
import { WorkflowStage } from '../workflow/entities/workflow-stage.entity';
import { WorkflowService } from '../workflow/workflow.service';
import {
  PreparationResponseDto,
  RevisePreparationDto
} from './dto/preparation.dto';
import { StagePreparation } from './entities/stage-preparation.entity';
import { HrGeneratorService } from './hr-generator.service';
import { PreparationSourceService } from './preparation-source.service';
import { HR_STAGE_CODE } from './preparation.constants';
import { PreparationTarget } from './preparation.enums';
import { HrDocuments, PreparationSources } from './preparation.types';
import { toPreparationResponse } from './preparation.utils';

@Injectable()
export class PreparationService {
  constructor(
    @InjectRepository(StagePreparation)
    public preparations: Repository<StagePreparation>,
    @InjectRepository(StageType) public types: Repository<StageType>,
    public workflows: WorkflowService,
    public sources: PreparationSourceService,
    public generator: HrGeneratorService,
    public dataSource: DataSource
  ) {}

  async requireHrStage(
    userId: string,
    workflowId: string,
    stageId: string
  ): Promise<void> {
    const stage = await this.workflows.requireStage(
      userId,
      workflowId,
      stageId
    );
    const type = await this.types.findOneBy({ id: stage.stageTypeId });
    if (!type || type.code !== HR_STAGE_CODE || type.ownerUserId !== null)
      throw new BadRequestException(
        'AI preparation is currently supported only for system HR stages'
      );
  }

  async latest(
    userId: string,
    workflowId: string,
    stageId: string
  ): Promise<PreparationResponseDto> {
    await this.requireHrStage(userId, workflowId, stageId);
    const current = await this.preparations.findOne({
      where: { stageId },
      order: { version: 'DESC' }
    });
    if (!current)
      throw new NotFoundException('HR preparation has not been generated yet');
    return toPreparationResponse(current);
  }

  async history(
    userId: string,
    workflowId: string,
    stageId: string
  ): Promise<PreparationResponseDto[]> {
    await this.requireHrStage(userId, workflowId, stageId);
    const versions = await this.preparations.find({
      where: { stageId },
      order: { version: 'DESC' }
    });
    return versions.map(toPreparationResponse);
  }

  async generate(
    userId: string,
    workflowId: string,
    stageId: string,
    authorization: string
  ): Promise<PreparationResponseDto> {
    await this.requireHrStage(userId, workflowId, stageId);
    const existing = await this.preparations.findOne({
      where: { stageId },
      order: { version: 'DESC' }
    });
    if (existing) return toPreparationResponse(existing);
    const workflow = await this.workflows.requireWorkflow(userId, workflowId);
    const sources = await this.sources.load(workflow.vacancyId, authorization);
    const documents = await this.generator.generate(sources);
    return this.persist(stageId, documents, sources);
  }

  async revise(
    userId: string,
    workflowId: string,
    stageId: string,
    input: RevisePreparationDto
  ): Promise<PreparationResponseDto> {
    await this.requireHrStage(userId, workflowId, stageId);
    const current = await this.preparations
      .createQueryBuilder('preparation')
      .addSelect('preparation.sources')
      .where('preparation.stageId = :stageId', { stageId })
      .orderBy('preparation.version', 'DESC')
      .getOne();
    if (!current)
      throw new NotFoundException(
        'Generate HR preparation before requesting revisions'
      );
    if (current.version !== input.baseVersion)
      throw new ConflictException(
        'Preparation changed; load the latest version before editing'
      );
    const documents = await this.generator.generate(current.sources, {
      prompt: input.prompt,
      target: input.target,
      current: { cv: current.cv, coverLetter: current.coverLetter }
    });
    if (input.target === PreparationTarget.CV)
      documents.coverLetter = current.coverLetter;
    if (input.target === PreparationTarget.COVER_LETTER)
      documents.cv = current.cv;
    return this.persist(stageId, documents, current.sources, input);
  }

  async persist(
    stageId: string,
    documents: HrDocuments,
    sources: PreparationSources,
    revision?: RevisePreparationDto
  ): Promise<PreparationResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const stage = await manager.findOne(WorkflowStage, {
        where: { id: stageId },
        lock: { mode: 'pessimistic_write' }
      });
      if (!stage)
        throw new NotFoundException('Workflow stage no longer exists');
      const current = await manager.findOne(StagePreparation, {
        where: { stageId },
        order: { version: 'DESC' }
      });
      if (!revision && current) return toPreparationResponse(current);
      if (revision && current?.version !== revision.baseVersion)
        throw new ConflictException(
          'Preparation changed; load the latest version before editing'
        );
      const saved = await manager.save(
        StagePreparation,
        manager.create(StagePreparation, {
          stageId,
          version: (current?.version ?? 0) + 1,
          ...documents,
          sources,
          prompt: revision?.prompt ?? null,
          target: revision?.target ?? PreparationTarget.BOTH
        })
      );
      return toPreparationResponse(saved);
    });
  }
}
