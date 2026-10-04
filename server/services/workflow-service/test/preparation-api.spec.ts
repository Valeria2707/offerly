import {
  ForbiddenException,
  INestApplication,
  Module,
  ValidationPipe
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SharedAuthModule } from '@offerly/auth';
import { createHmac } from 'node:crypto';
import { PreparationController } from '../src/preparation/preparation.controller';
import { PreparationService } from '../src/preparation/preparation.service';
import { PreparationType } from '../src/preparation/preparation.enums';
const workflowId = '11111111-1111-4111-8111-111111111111';
const stageId = '22222222-2222-4222-8222-222222222222';
const questionId = '33333333-3333-4333-8333-333333333333';
const secret = 'preparation-api-test-secret';
const result = {
  id: questionId,
  stageId,
  data: {
    type: PreparationType.CV_COVER_LETTER,
    content: {
      cvTips: ['Tip'],
      coverLetterDraft: 'Draft',
      tailoredKeywords: []
    }
  },
  instructions: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
const service = {
  get: jest.fn(),
  generate: jest.fn(),
  answer: jest.fn(),
  remove: jest.fn()
};
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [(): { JWT_SECRET: string } => ({ JWT_SECRET: secret })]
    }),
    SharedAuthModule
  ],
  controllers: [PreparationController],
  providers: [{ provide: PreparationService, useValue: service }]
})
class ApiTestModule {}
function token(): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'user',
      iss: 'auth-service',
      aud: 'microservices-api',
      jti: 'test',
      exp: Math.floor(Date.now() / 1000) + 60
    })
  ).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}
describe('preparation HTTP API', () => {
  let app: INestApplication;
  let base: string;
  beforeAll(async () => {
    app = await NestFactory.create(ApiTestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );
    await app.listen(0, '127.0.0.1');
    base = `${await app.getUrl()}/api/v1/workflows/${workflowId}/stages/${stageId}/preparation`;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    service.get.mockResolvedValue(result);
    service.generate.mockResolvedValue(result);
    service.answer.mockResolvedValue(result);
    service.remove.mockResolvedValue(undefined);
  });
  afterAll(async () => {
    await app?.close();
  });
  async function request(
    method: string,
    body?: unknown,
    path = ''
  ): Promise<Response> {
    return fetch(base + path, {
      method,
      headers: {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json'
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }
  it('rejects absent and invalid JWTs for every operation', async () => {
    for (const [method, path] of [
      ['GET', ''],
      ['POST', ''],
      ['PATCH', `/questions/${questionId}`],
      ['DELETE', '']
    ]) {
      expect((await fetch(base + path, { method })).status).toBe(401);
    }
    expect(
      (await fetch(base, { headers: { Authorization: 'Bearer invalid' } }))
        .status
    ).toBe(401);
    expect(service.get).not.toHaveBeenCalled();
    expect(service.generate).not.toHaveBeenCalled();
  });
  it('reads, generates, updates answers and deletes using the authenticated subject', async () => {
    expect(await (await request('GET')).json()).toEqual(result);
    expect(service.get).toHaveBeenCalledWith('user', workflowId, stageId);
    const generated = await request('POST', {
      instructions: 'Portfolio discussion'
    });
    expect(generated.status).toBe(201);
    expect(service.generate).toHaveBeenCalledWith(
      'user',
      workflowId,
      stageId,
      { instructions: 'Portfolio discussion' },
      expect.stringMatching(/^Bearer /)
    );
    expect(
      (
        await request(
          'PATCH',
          { userAnswer: 'My answer' },
          `/questions/${questionId}`
        )
      ).status
    ).toBe(200);
    expect(service.answer).toHaveBeenCalledWith(
      'user',
      workflowId,
      stageId,
      questionId,
      'My answer'
    );
    const removed = await request('DELETE');
    expect(removed.status).toBe(204);
    expect(await removed.text()).toBe('');
  });
  it.each([
    { type: 'invalid' },
    { type: null },
    { instructions: null },
    { instructions: '   ' },
    { instructions: 'x'.repeat(5001) },
    { unknown: true }
  ])('validates generation body %j', async (body) => {
    expect((await request('POST', body)).status).toBe(400);
    expect(service.generate).not.toHaveBeenCalled();
  });
  it('validates answer bodies and all route UUIDs', async () => {
    for (const body of [
      {},
      { userAnswer: null },
      { userAnswer: 1 },
      { userAnswer: 'x'.repeat(10001) },
      { userAnswer: 'ok', question: 'replace' }
    ])
      expect(
        (await request('PATCH', body, `/questions/${questionId}`)).status
      ).toBe(400);
    expect(
      (await request('PATCH', { userAnswer: 'ok' }, '/questions/invalid'))
        .status
    ).toBe(400);
    expect(
      (
        await fetch(base.replace(workflowId, 'invalid'), {
          headers: { Authorization: `Bearer ${token()}` }
        })
      ).status
    ).toBe(400);
    expect(service.answer).not.toHaveBeenCalled();
  });
  it('preserves authorization errors from the service', async () => {
    service.get.mockRejectedValueOnce(
      new ForbiddenException('Workflow does not belong to user')
    );
    expect((await request('GET')).status).toBe(403);
  });
  it('documents all operations and the discriminated content variants', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build()
    );
    const route =
      document.paths[
        '/api/v1/workflows/{workflowId}/stages/{stageId}/preparation'
      ];
    expect(route.get?.responses['200']).toBeDefined();
    expect(route.post?.responses['409']).toBeDefined();
    expect(route.delete?.responses['204']).toBeDefined();
    expect(document.components?.schemas?.PreparationResponseDto).toBeDefined();
    expect(document.components?.schemas?.TechnicalContent).toBeDefined();
  });
});
