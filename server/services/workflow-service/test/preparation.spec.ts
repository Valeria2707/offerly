import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { StageType } from '../src/stage-type/entities/stage-type.entity';
import { StageCategory } from '../src/workflow/workflow.enums';
import { WorkflowService } from '../src/workflow/workflow.service';
import { PreparationContextService } from '../src/preparation/services/preparation-context.service';
import { PreparationGeneratorService } from '../src/preparation/services/preparation-generator.service';
import { PreparationType } from '../src/preparation/preparation.enums';
import { parsePreparation } from '../src/preparation/output/preparation-output.parser';
import { questionItems } from '../src/utils/preparation.utils';
import { PreparationService } from '../src/preparation/preparation.service';
import { StagePreparationData } from '../src/preparation/entities/stage-preparation.entity';
import { CustomPreparationStrategy } from '../src/preparation/strategies/custom-preparation.strategy';
import { CvPreparationStrategy } from '../src/preparation/strategies/cv-preparation.strategy';
import { HrPreparationStrategy } from '../src/preparation/strategies/hr-preparation.strategy';
import { PreparationStrategyFactory } from '../src/preparation/strategies/preparation-strategy.factory';
import { TechnicalPreparationStrategy } from '../src/preparation/strategies/technical-preparation.strategy';

const hrContent = {
  elevatorPitch: 'My experience',
  commonQuestions: [
    {
      id: 'model-id',
      question: 'Tell me about a project',
      tips: 'Use STAR',
      expectedAnswer: 'Describe your contribution'
    }
  ],
  questionsToAskInterviewer: ['What does success look like?']
};
function createFactory(): PreparationStrategyFactory {
  const generator = new PreparationGeneratorService(new ConfigService({}));
  return new PreparationStrategyFactory(
    new CvPreparationStrategy(generator),
    new HrPreparationStrategy(generator),
    new TechnicalPreparationStrategy(generator),
    new CustomPreparationStrategy(generator)
  );
}
describe('preparation selection and validation', () => {
  const factory = createFactory();
  it.each([
    [
      'submitted',
      StageCategory.ADMINISTRATIVE,
      PreparationType.CV_COVER_LETTER
    ],
    ['hr_screening', StageCategory.SCREENING, PreparationType.HR_SCREENING],
    ['technical_interview', StageCategory.TECHNICAL, PreparationType.TECHNICAL],
    ['pre_tech_screening', StageCategory.SCREENING, PreparationType.TECHNICAL],
    ['final_interview', StageCategory.BEHAVIORAL, PreparationType.HR_SCREENING],
    ['offer', StageCategory.ADMINISTRATIVE, PreparationType.CUSTOM],
    ['offer_negotiation', StageCategory.ADMINISTRATIVE, PreparationType.CUSTOM]
  ])('maps %s independently of stage position', (code, category, expected) => {
    expect(
      factory.resolveType(
        Object.assign(new StageType(), { code, category, ownerUserId: null })
      )
    ).toBe(expected);
  });
  it('refuses preparation for the rejection stage', () => {
    expect(() =>
      factory.resolveType(
        Object.assign(new StageType(), {
          code: 'rejection',
          category: StageCategory.ADMINISTRATIVE,
          ownerUserId: null
        })
      )
    ).toThrow(BadRequestException);
  });
  it('requires a personal stage for explicit format overrides', () => {
    const type = Object.assign(new StageType(), { ownerUserId: 'user' });
    expect(factory.resolveType(type)).toBe(PreparationType.CUSTOM);
    expect(factory.resolveType(type, PreparationType.TECHNICAL)).toBe(
      PreparationType.TECHNICAL
    );
    expect(() =>
      factory.resolveType(
        Object.assign(type, { ownerUserId: null }),
        PreparationType.TECHNICAL
      )
    ).toThrow(BadRequestException);
  });
  it.each([
    [
      PreparationType.CV_COVER_LETTER,
      {
        cvTips: ['Highlight results'],
        coverLetterDraft: 'Dear team',
        tailoredKeywords: ['React']
      }
    ],
    [PreparationType.HR_SCREENING, hrContent],
    [
      PreparationType.TECHNICAL,
      {
        targetStack: ['React'],
        theoreticalQuestions: hrContent.commonQuestions,
        codingTasks: [{ task: 'Implement a cache', hint: 'Consider eviction' }]
      }
    ],
    [
      PreparationType.CUSTOM,
      { instructions: 'Portfolio review', items: hrContent.commonQuestions }
    ]
  ])('validates %s content', (type, content) =>
    expect(parsePreparation(type, content).type).toBe(type)
  );
  it('rejects mismatched, extra, null and malformed nested content', () => {
    for (const content of [
      null,
      [],
      {},
      hrContent,
      { ...hrContent, commonQuestions: [null] },
      { ...hrContent, commonQuestions: [{ question: 12 }] }
    ]) {
      expect(() =>
        parsePreparation(PreparationType.TECHNICAL, content)
      ).toThrow(UnprocessableEntityException);
    }
    expect(() =>
      parsePreparation(PreparationType.HR_SCREENING, {
        ...hrContent,
        secret: 'unexpected'
      })
    ).toThrow(UnprocessableEntityException);
    expect(() =>
      parsePreparation(PreparationType.HR_SCREENING, {
        ...hrContent,
        commonQuestions: [null]
      })
    ).toThrow(UnprocessableEntityException);
  });
  it('assigns unique server IDs and never trusts generated user answers', () => {
    const data = parsePreparation(PreparationType.HR_SCREENING, {
      ...hrContent,
      commonQuestions: [
        { ...hrContent.commonQuestions[0], userAnswer: 'fabricated' },
        hrContent.commonQuestions[0]
      ]
    });
    const items = questionItems(data);
    expect(items[0].id).not.toBe(items[1].id);
    expect(items[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(items[0].userAnswer).toBeUndefined();
  });
});
function fixture(): {
  service: PreparationService;
  preparations: { existsBy: jest.Mock; findOneBy: jest.Mock };
  workflows: {
    requireStage: jest.Mock;
    requireWorkflow: jest.Mock;
    stages: { findOne: jest.Mock };
  };
  manager: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    existsBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  load: jest.Mock;
  generate: jest.Mock;
} {
  const preparations = {
    existsBy: jest.fn().mockResolvedValue(false),
    findOneBy: jest.fn()
  };
  const workflows = {
    requireStage: jest.fn().mockResolvedValue({ id: 'stage' }),
    requireWorkflow: jest.fn().mockResolvedValue({ vacancyId: 'vacancy' }),
    stages: {
      findOne: jest.fn().mockResolvedValue({
        name: 'HR',
        category: StageCategory.SCREENING,
        stageType: {
          ownerUserId: null,
          code: 'hr_screening',
          category: StageCategory.SCREENING
        }
      })
    }
  };
  const manager = {
    findOne: jest.fn().mockResolvedValue({ id: 'stage' }),
    findOneBy: jest.fn(),
    existsBy: jest.fn().mockResolvedValue(false),
    create: jest.fn((_entity: unknown, value: unknown) => value),
    save: jest.fn((_entity: unknown, value: unknown) => Promise.resolve(value)),
    delete: jest.fn().mockResolvedValue({ affected: 1 })
  };
  const load = jest.fn().mockResolvedValue({
    vacancy: { title: 'Developer' },
    profile: { skills: [] }
  });
  const generate = jest
    .fn()
    .mockResolvedValue(
      parsePreparation(PreparationType.HR_SCREENING, hrContent)
    );
  const factory = createFactory();
  jest.spyOn(factory, 'getStrategy').mockReturnValue({ generate });
  const dataSource = {
    transaction: async (
      callback: (value: typeof manager) => Promise<unknown>
    ): Promise<unknown> => callback(manager)
  };
  return {
    service: new PreparationService(
      preparations as unknown as Repository<StagePreparationData>,
      workflows as unknown as WorkflowService,
      { load } as unknown as PreparationContextService,
      factory,
      dataSource as unknown as DataSource
    ),
    preparations,
    workflows,
    manager,
    load,
    generate
  };
}
describe('preparation persistence business rules', () => {
  it('saves a typed result after loading authorized context', async () => {
    const f = fixture();
    const result = await f.service.generate(
      'user',
      'workflow',
      'stage',
      {},
      'Bearer token'
    );
    expect(result.data.type).toBe(PreparationType.HR_SCREENING);
    expect(f.load).toHaveBeenCalledWith('vacancy', 'Bearer token');
    expect(f.manager.findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } })
    );
  });
  it('requires instructions for personal stages, including overrides', async () => {
    const f = fixture();
    f.workflows.stages.findOne.mockResolvedValue({
      name: 'Portfolio',
      category: StageCategory.TECHNICAL,
      stageType: { ownerUserId: 'user', code: null }
    });
    await expect(
      f.service.generate(
        'user',
        'workflow',
        'stage',
        { type: PreparationType.TECHNICAL },
        'token'
      )
    ).rejects.toThrow(BadRequestException);
    expect(f.load).not.toHaveBeenCalled();
  });
  it('blocks foreign users before reading materials or calling AI', async () => {
    const f = fixture();
    f.workflows.requireStage.mockRejectedValue(new ForbiddenException());
    f.workflows.requireWorkflow.mockRejectedValue(new ForbiddenException());
    await expect(f.service.get('other', 'workflow', 'stage')).rejects.toThrow(
      ForbiddenException
    );
    await expect(
      f.service.generate('other', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(ForbiddenException);
    await expect(
      f.service.answer('other', 'workflow', 'stage', 'question', 'answer')
    ).rejects.toThrow(ForbiddenException);
    await expect(
      f.service.remove('other', 'workflow', 'stage')
    ).rejects.toThrow(ForbiddenException);
    expect(f.preparations.findOneBy).not.toHaveBeenCalled();
    expect(f.generate).not.toHaveBeenCalled();
    expect(f.manager.save).not.toHaveBeenCalled();
  });
  it('does not overwrite existing materials or lose answers during concurrent generation', async () => {
    const f = fixture();
    f.preparations.existsBy.mockResolvedValue(true);
    await expect(
      f.service.generate('user', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(ConflictException);
    expect(f.generate).not.toHaveBeenCalled();
    f.preparations.existsBy.mockResolvedValue(false);
    f.manager.existsBy.mockResolvedValue(true);
    await expect(
      f.service.generate('user', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(ConflictException);
    expect(f.manager.save).not.toHaveBeenCalled();
  });
  it('passes the stage code to the strategy and rejects a second click while generating', async () => {
    const f = fixture();
    let finish: () => void = () => undefined;
    f.generate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = (): void =>
            resolve(parsePreparation(PreparationType.HR_SCREENING, hrContent));
        })
    );
    const first = f.service.generate('user', 'workflow', 'stage', {}, 'token');
    await new Promise((resolve) => setImmediate(resolve));
    await expect(
      f.service.generate('user', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(ConflictException);
    finish();
    await first;
    expect(f.generate).toHaveBeenCalledTimes(1);
    expect(f.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: expect.objectContaining({ code: 'hr_screening' })
      })
    );
  });
  it('reports a missing stage without calling AI', async () => {
    const f = fixture();
    f.workflows.stages.findOne.mockResolvedValue(null);
    await expect(
      f.service.generate('user', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(NotFoundException);
    expect(f.generate).not.toHaveBeenCalled();
  });
  it('does not save provider failures or a result whose stage was removed', async () => {
    const f = fixture();
    f.generate.mockRejectedValueOnce(new UnprocessableEntityException());
    await expect(
      f.service.generate('user', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(UnprocessableEntityException);
    f.manager.findOne.mockResolvedValue(null);
    await expect(
      f.service.generate('user', 'workflow', 'stage', {}, 'token')
    ).rejects.toThrow(NotFoundException);
    expect(f.manager.save).not.toHaveBeenCalled();
  });
  it('updates only the selected question and allows clearing its answer', async () => {
    const f = fixture();
    const data = parsePreparation(PreparationType.HR_SCREENING, hrContent);
    const question = questionItems(data)[0];
    f.manager.findOneBy.mockResolvedValue({ stageId: 'stage', data });
    await f.service.answer(
      'user',
      'workflow',
      'stage',
      question.id,
      'My answer'
    );
    expect(question.userAnswer).toBe('My answer');
    await f.service.answer('user', 'workflow', 'stage', question.id, '');
    expect(question.userAnswer).toBe('');
    await expect(
      f.service.answer('user', 'workflow', 'stage', 'missing', 'answer')
    ).rejects.toThrow(NotFoundException);
  });
  it('reports missing preparation and deletes explicitly', async () => {
    const f = fixture();
    await expect(f.service.get('user', 'workflow', 'stage')).rejects.toThrow(
      NotFoundException
    );
    await f.service.remove('user', 'workflow', 'stage');
    expect(f.manager.delete).toHaveBeenCalledWith(StagePreparationData, {
      stageId: 'stage'
    });
  });
});
