import {
  INestApplication,
  Module,
  ServiceUnavailableException,
  ValidationPipe
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedAuthModule } from '@offerly/auth';
import { createHmac, randomUUID } from 'node:crypto';
import { DataSource, IsNull } from 'typeorm';
import { NotesModule } from '../src/notes/notes.module';
import { StageNote } from '../src/notes/entities/stage-note.entity';
import { StagePreparation } from '../src/preparation/entities/stage-preparation.entity';
import { HrGeneratorService } from '../src/preparation/hr-generator.service';
import { PreparationController } from '../src/preparation/preparation.controller';
import { PreparationSourceService } from '../src/preparation/preparation-source.service';
import { PreparationService } from '../src/preparation/preparation.service';
import { PreparationResponseDto } from '../src/preparation/dto/preparation.dto';
import { StageType } from '../src/stage-type/entities/stage-type.entity';
import { StageTypeService } from '../src/stage-type/stage-type.service';
import { ApplicationWorkflow } from '../src/workflow/entities/application-workflow.entity';
import { WorkflowStage } from '../src/workflow/entities/workflow-stage.entity';
import { WorkflowModule } from '../src/workflow/workflow.module';
import { WorkflowService } from '../src/workflow/workflow.service';
import { StageCategory } from '../src/workflow/workflow.enums';
import {
  HrDocuments,
  PreparationSources,
  PreparationRevision
} from '../src/preparation/preparation.types';

const databaseUrl = process.env.WORKFLOW_TEST_DATABASE_URL;
const secret = 'workflow-integration-test-secret-only';
const generate = jest.fn<
  Promise<HrDocuments>,
  [PreparationSources, PreparationRevision?]
>();
const load = jest.fn().mockResolvedValue({
  profile: { basics: { fullName: 'Candidate' }, skills: [{ name: 'NestJS' }] },
  vacancy: { title: 'Backend Engineer' }
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [(): Record<string, string> => ({ JWT_SECRET: secret })]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: databaseUrl,
        entities: [
          StageType,
          ApplicationWorkflow,
          WorkflowStage,
          StagePreparation,
          StageNote
        ],
        synchronize: true,
        retryAttempts: 1
      })
    }),
    TypeOrmModule.forFeature([StagePreparation, StageType]),
    SharedAuthModule,
    WorkflowModule,
    NotesModule
  ],
  controllers: [PreparationController],
  providers: [
    PreparationService,
    { provide: HrGeneratorService, useValue: { generate } },
    { provide: PreparationSourceService, useValue: { load } }
  ]
})
class TestAppModule {}

function token(userId: string): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email: 'test@example.com',
      name: 'Candidate',
      jti: randomUUID(),
      iss: 'auth-service',
      aud: 'microservices-api',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
  ).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

const integration = databaseUrl ? describe : describe.skip;
integration('HR preparation and notes over HTTP/PostgreSQL', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let baseUrl: string;
  let workflow: ApplicationWorkflow;
  let hrStage: WorkflowStage;
  let otherStage: WorkflowStage;
  const userId = randomUUID();
  const bearer = token(userId);

  async function request(
    path: string,
    method = 'GET',
    body?: object,
    auth: string | null = bearer
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (auth) headers.Authorization = `Bearer ${auth}`;
    return fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  }
  function stagePath(stageId = hrStage.id): string {
    return `/workflows/${workflow.id}/stages/${stageId}`;
  }

  beforeAll(async () => {
    if (
      !databaseUrl ||
      new URL(databaseUrl).pathname !== '/offerly_workflow_test'
    )
      throw new Error(
        'Integration tests require a dedicated offerly_workflow_test database'
      );
    app = await NestFactory.create(TestAppModule, {
      logger: false,
      abortOnError: false
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
    dataSource = app.get(DataSource);
    const types = dataSource.getRepository(StageType);
    const catalog = new StageTypeService(types);
    await catalog.onModuleInit();
    await catalog.onModuleInit();
    expect(await types.countBy({ ownerUserId: IsNull() })).toBe(13);
    const workflowService = app.get(WorkflowService);
    const vacancyId = randomUUID();
    await workflowService.createDefault(vacancyId, userId);
    workflow = await workflowService.getByVacancy(userId, vacancyId);
    const hrType = await types.findOneByOrFail({ code: 'hr_screening' });
    const found = workflow.stages.find(
      (stage) => stage.stageTypeId === hrType.id
    );
    if (!found) throw new Error('HR stage is missing');
    hrStage = found;
    otherStage = workflow.stages[0];
  }, 30000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.getRepository(ApplicationWorkflow).delete({ userId });
      await dataSource.getRepository(StageType).delete({ ownerUserId: userId });
    }
    if (app) await app.close();
  });
  beforeEach(() => {
    generate.mockReset();
    generate.mockResolvedValue({
      cv: '# Original CV',
      coverLetter: 'Original letter'
    });
  });

  it('requires authentication and rejects foreign workflow access', async () => {
    expect(
      (await request(`${stagePath()}/notes`, 'GET', undefined, null)).status
    ).toBe(401);
    expect(
      (
        await request(
          `${stagePath()}/preparation`,
          'POST',
          undefined,
          token(randomUUID())
        )
      ).status
    ).toBe(403);
    expect(generate).not.toHaveBeenCalled();
  });

  it('rejects non-HR and custom stages, including a custom HR-named stage', async () => {
    expect(
      (await request(`${stagePath(otherStage.id)}/preparation`, 'POST')).status
    ).toBe(400);
    const types = dataSource.getRepository(StageType);
    const custom = await types.save(
      types.create({
        ownerUserId: userId,
        code: null,
        name: 'HR screening',
        category: StageCategory.SCREENING,
        expectedDurationMinutes: 30,
        isActive: true
      })
    );
    const stage = await app
      .get(WorkflowService)
      .addStage(userId, workflow.id, { stageTypeId: custom.id });
    expect(
      (await request(`${stagePath(stage.id)}/preparation`, 'POST')).status
    ).toBe(400);
    expect(generate).not.toHaveBeenCalled();
  });

  it('first opening generates documents and repeat opening reuses them', async () => {
    expect((await request(`${stagePath()}/preparation`)).status).toBe(404);
    const first = await request(`${stagePath()}/preparation`, 'POST');
    expect(first.status).toBe(200);
    const result: PreparationResponseDto = await first.json();
    expect(result).toMatchObject({
      version: 1,
      cv: '# Original CV',
      coverLetter: 'Original letter'
    });
    expect(result).not.toHaveProperty('sources');
    const repeated = await request(`${stagePath()}/preparation`, 'POST');
    expect(await repeated.json()).toMatchObject({ id: result.id, version: 1 });
    expect(generate).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(workflow.vacancyId, `Bearer ${bearer}`);
  });

  it('validates prompts and preserves the previous documents on AI failure', async () => {
    const path = `${stagePath()}/preparation/revisions`;
    expect(
      (
        await request(path, 'POST', {
          baseVersion: 1,
          target: 'cv',
          prompt: ' '
        })
      ).status
    ).toBe(400);
    expect(
      (
        await request(path, 'POST', {
          baseVersion: 0,
          target: 'cv',
          prompt: 'Edit'
        })
      ).status
    ).toBe(400);
    generate.mockRejectedValueOnce(
      new ServiceUnavailableException('AI failed')
    );
    expect(
      (
        await request(path, 'POST', {
          baseVersion: 1,
          target: 'cv',
          prompt: 'Edit'
        })
      ).status
    ).toBe(503);
    expect(
      await (await request(`${stagePath()}/preparation`)).json()
    ).toMatchObject({ version: 1, cv: '# Original CV' });
  });

  it('stores only one concurrent revision and preserves the untargeted document', async () => {
    generate.mockResolvedValue({
      cv: '# Revised CV',
      coverLetter: 'Unwanted changed letter'
    });
    const input = {
      baseVersion: 1,
      target: 'cv',
      prompt: 'Shorten my summary'
    };
    const responses = await Promise.all([
      request(`${stagePath()}/preparation/revisions`, 'POST', input),
      request(`${stagePath()}/preparation/revisions`, 'POST', input)
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 409
    ]);
    expect(
      await (await request(`${stagePath()}/preparation`)).json()
    ).toMatchObject({
      version: 2,
      cv: '# Revised CV',
      coverLetter: 'Original letter'
    });
    const versions: PreparationResponseDto[] = await (
      await request(`${stagePath()}/preparation/versions`)
    ).json();
    expect(versions.map((version) => version.version)).toEqual([2, 1]);
    expect(versions[1].cv).toBe('# Original CV');
  });

  it('edits a cover letter independently and supports updating both documents', async () => {
    generate.mockResolvedValue({
      cv: 'Unwanted CV change',
      coverLetter: 'Revised letter'
    });
    const letter = await request(
      `${stagePath()}/preparation/revisions`,
      'POST',
      {
        baseVersion: 2,
        target: 'cover_letter',
        prompt: 'Shorten the letter'
      }
    );
    expect(letter.status).toBe(200);
    expect(await letter.json()).toMatchObject({
      version: 3,
      cv: '# Revised CV',
      coverLetter: 'Revised letter'
    });
    generate.mockResolvedValue({ cv: '# Both CV', coverLetter: 'Both letter' });
    const both = await request(`${stagePath()}/preparation/revisions`, 'POST', {
      baseVersion: 3,
      target: 'both',
      prompt: 'Use a concise tone'
    });
    expect(await both.json()).toMatchObject({
      version: 4,
      cv: '# Both CV',
      coverLetter: 'Both letter'
    });
  });

  it('can retry a failed first generation and deduplicates concurrent first openings', async () => {
    const stage = await app
      .get(WorkflowService)
      .addStage(userId, workflow.id, { stageTypeId: hrStage.stageTypeId });
    const path = `${stagePath(stage.id)}/preparation`;
    generate.mockRejectedValueOnce(
      new ServiceUnavailableException('AI unavailable')
    );
    expect((await request(path, 'POST')).status).toBe(503);
    expect(
      await dataSource
        .getRepository(StagePreparation)
        .countBy({ stageId: stage.id })
    ).toBe(0);
    const responses = await Promise.all([
      request(path, 'POST'),
      request(path, 'POST')
    ]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    const [first, second]: PreparationResponseDto[] = await Promise.all(
      responses.map((response) => response.json())
    );
    expect(first.id).toBe(second.id);
    expect(
      await dataSource
        .getRepository(StagePreparation)
        .countBy({ stageId: stage.id })
    ).toBe(1);
  });

  it('adds, edits and removes stage-scoped notes on any stage', async () => {
    const notesPath = `${stagePath(otherStage.id)}/notes`;
    const added = await request(notesPath, 'POST', {
      content: 'Ask about onboarding'
    });
    expect(added.status).toBe(201);
    const note: StageNote = await added.json();
    expect(
      (
        await request(`${stagePath()}/notes/${note.id}`, 'PATCH', {
          content: 'Wrong stage'
        })
      ).status
    ).toBe(404);
    expect(
      (
        await request(`${notesPath}/${note.id}`, 'PATCH', {
          content: 'Ask about the team'
        })
      ).status
    ).toBe(200);
    expect(await (await request(notesPath)).json()).toEqual([
      expect.objectContaining({ id: note.id, content: 'Ask about the team' })
    ]);
    expect((await request(`${notesPath}/${note.id}`, 'DELETE')).status).toBe(
      204
    );
    expect(await (await request(notesPath)).json()).toEqual([]);
  });

  it('cascades stage deletion to documents and notes', async () => {
    await request(`${stagePath()}/notes`, 'POST', {
      content: 'Temporary note'
    });
    await app.get(WorkflowService).removeStage(userId, workflow.id, hrStage.id);
    expect(
      await dataSource
        .getRepository(StagePreparation)
        .countBy({ stageId: hrStage.id })
    ).toBe(0);
    expect(
      await dataSource.getRepository(StageNote).countBy({ stageId: hrStage.id })
    ).toBe(0);
  });
});
