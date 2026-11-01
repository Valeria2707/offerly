import { ConfigService } from '@nestjs/config';
import {
  ServiceUnavailableException,
  UnprocessableEntityException,
  NotFoundException
} from '@nestjs/common';
import { PreparationGeneratorService } from '../src/preparation/services/preparation-generator.service';
import { PreparationContextService } from '../src/preparation/services/preparation-context.service';
import { PreparationType } from '../src/preparation/preparation.enums';
import { JsonSchema } from '../src/preparation/preparation.types';
import { requestStructuredOutput } from '../src/preparation/services/openai-structured-output';
import { UpstreamService } from '../src/upstream/upstream.service';

const SERVICE_URLS = {
  VACANCY_SERVICE_URL: 'http://vacancy-service:3003',
  PROFILE_SERVICE_URL: 'http://profile-service:3002'
};
const contextService = (): PreparationContextService =>
  new PreparationContextService(
    new UpstreamService(new ConfigService(SERVICE_URLS))
  );
const context = {
  vacancy: { title: 'Developer' },
  profile: {},
  stage: { name: 'Submitted', category: 'administrative', code: 'submitted' },
  instructions: '',
  pastQuestions: []
};
describe('preparation provider boundary', () => {
  afterEach(() => jest.restoreAllMocks());
  it('answers 503 instead of crashing on missing or partial configuration', async () => {
    for (const env of [
      {},
      { OPENAI_MODEL: 'model' },
      { OPENAI_API_KEY: 'key' }
    ]) {
      const service = new PreparationGeneratorService(new ConfigService(env));
      await expect(
        service.generate(PreparationType.CV_COVER_LETTER, 'CV', context)
      ).rejects.toThrow(ServiceUnavailableException);
    }
    expect(
      () =>
        new UpstreamService(
          new ConfigService({
            ...SERVICE_URLS,
            PROFILE_SERVICE_URL: 'file:///tmp'
          })
        )
    ).toThrow();
  });
  it('requests structured output, disables storage, validates and returns it', async () => {
    const content = {
      cvTips: ['Use metrics'],
      coverLetterDraft: 'Dear team',
      tailoredKeywords: ['React']
    };
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        output: [
          {
            content: [{ type: 'output_text', text: JSON.stringify(content) }]
          }
        ]
      })
    );
    const service = new PreparationGeneratorService(
      new ConfigService({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' })
    );
    expect(
      await service.generate(PreparationType.CV_COVER_LETTER, 'CV', context)
    ).toEqual({ type: PreparationType.CV_COVER_LETTER, content });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      store: boolean;
      text: { format: { strict: boolean } };
    };
    expect(body.store).toBe(false);
    expect(body.text.format.strict).toBe(true);
  });
  it('asks for the language chosen by the user, otherwise leaves it to the vacancy', async () => {
    const content = {
      cvTips: ['Use metrics'],
      coverLetterDraft: 'Dear team',
      tailoredKeywords: ['React']
    };
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Response.json({
          output: [
            {
              content: [{ type: 'output_text', text: JSON.stringify(content) }]
            }
          ]
        })
      )
    );
    const service = new PreparationGeneratorService(
      new ConfigService({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' })
    );
    const instructions = (call: number): string =>
      (
        JSON.parse(String(fetchMock.mock.calls[call][1]?.body)) as {
          instructions: string;
        }
      ).instructions;
    await service.generate(PreparationType.CV_COVER_LETTER, 'CV', {
      ...context,
      language: 'uk'
    });
    await service.generate(PreparationType.CV_COVER_LETTER, 'CV', context);
    expect(instructions(0)).toContain('Write all text in Ukrainian');
    expect(instructions(1)).not.toContain('Write all text in');
  });
  it('keeps the user description for custom stages and lets the server set question ids', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        output: [
          {
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  items: [{ question: 'Q', tips: 'T', expectedAnswer: 'A' }]
                })
              }
            ]
          }
        ]
      })
    );
    const service = new PreparationGeneratorService(
      new ConfigService({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'model' })
    );
    const result = await service.generate(
      PreparationType.CUSTOM,
      'Stage prompt',
      { ...context, instructions: 'Portfolio review with CTO' }
    );
    expect(result.type).toBe(PreparationType.CUSTOM);
    if (result.type !== PreparationType.CUSTOM) return;
    expect(result.content.instructions).toBe('Portfolio review with CTO');
    expect(result.content.items[0].id).toMatch(/^[0-9a-f-]{36}$/);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      instructions: string;
      text: { format: { schema: { properties: Record<string, unknown> } } };
    };
    expect(body.instructions).toContain('Stage prompt');
    expect(body.instructions).toContain('untrusted data');
    expect(Object.keys(body.text.format.schema.properties)).toEqual(['items']);
  });
  it.each([
    {},
    { output: [{ content: [{ type: 'refusal' }] }] },
    { output: [{ content: [{ type: 'output_text', text: '{}' }] }] },
    { output: [{ content: [{ type: 'output_text', text: 'invalid' }] }] }
  ])('rejects invalid AI content', async (payload) => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(payload));
    const service = new PreparationGeneratorService(
      new ConfigService({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'model' })
    );
    await expect(
      service.generate(PreparationType.TECHNICAL, 'Tech', context)
    ).rejects.toThrow(UnprocessableEntityException);
  });
  it('maps network and upstream errors to safe errors', async () => {
    const mock = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('secret provider detail'))
      .mockResolvedValueOnce(new Response('', { status: 429 }));
    const service = new PreparationGeneratorService(
      new ConfigService({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'model' })
    );
    await expect(
      service.generate(PreparationType.TECHNICAL, 'Tech', context)
    ).rejects.toThrow(ServiceUnavailableException);
    await expect(
      service.generate(PreparationType.TECHNICAL, 'Tech', context)
    ).rejects.toThrow(ServiceUnavailableException);
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('loads context with user authorization and omits contact metadata', async () => {
    const mock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.json({
          title: 'Developer',
          requiredSkills: ['React'],
          userId: 'user'
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          data: {
            basics: {
              fullName: 'Candidate',
              email: 'private',
              phone: 'private'
            },
            skills: [],
            experience: []
          }
        })
      );
    const result = await contextService().load('vacancy', 'Bearer user-token');
    expect(result.vacancy).toEqual({
      title: 'Developer',
      requiredSkills: ['React']
    });

    expect(result.profile.basics).toEqual({});
    expect(
      mock.mock.calls.every(
        (call) =>
          call[1]?.headers &&
          (call[1].headers as Record<string, string>).Authorization ===
            'Bearer user-token'
      )
    ).toBe(true);
  });
  it('does not generate context for an inaccessible vacancy', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 404 }));
    await expect(
      contextService().load('vacancy', 'Bearer token')
    ).rejects.toThrow(NotFoundException);
  });
  it('removes e-mails and phones from everything sent to the AI', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        output: [{ content: [{ type: 'output_text', text: '{}' }] }]
      })
    );
    await requestStructuredOutput({
      apiKey: 'key',
      model: 'model',
      instructions: 'Prompt',
      input: JSON.stringify({
        summary: 'Write to jane@example.com or call +380 67 123 45 67'
      }),
      schemaName: 'test',
      schema: {} as JsonSchema,
      label: 'test'
    });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      input: string;
      max_output_tokens: number;
    };
    expect(body.input).not.toContain('jane@example.com');
    expect(body.input).toContain('[email]');
    expect(body.input).toContain('[phone]');
    expect(body.max_output_tokens).toBeGreaterThan(0);
  });
});
