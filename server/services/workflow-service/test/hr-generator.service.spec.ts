import { ConfigService } from '@nestjs/config';
import { HrGeneratorService } from '../src/preparation/hr-generator.service';

describe('HR generator provider boundary', () => {
  const sources = {
    profile: { skills: ['NestJS'] },
    vacancy: { title: 'Developer' }
  };
  const config = new ConfigService({
    OPENAI_API_KEY: 'test-key',
    OPENAI_MODEL: 'test-model'
  });
  afterEach(() => jest.restoreAllMocks());

  it('sends factual sources with store disabled and accepts structured documents', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  type: 'output_text',
                  text: JSON.stringify({ cv: '# CV', coverLetter: 'Dear team' })
                }
              ]
            }
          ]
        })
      )
    );
    await expect(
      new HrGeneratorService(config).generate(sources)
    ).resolves.toEqual({ cv: '# CV', coverLetter: 'Dear team' });
    const body = fetchMock.mock.calls[0][1]?.body;
    expect(typeof body).toBe('string');
    expect(body).toContain('"store":false');
    expect(body).toContain('Never invent skills');
  });

  it.each([
    { output: [] },
    { output: [{ content: [{ type: 'refusal', text: 'Cannot comply' }] }] },
    { output: [{ content: [{ type: 'output_text', text: 'not json' }] }] },
    { output: [{ content: [{ type: 'output_text', text: 'null' }] }] },
    {
      output: [
        {
          content: [
            { type: 'output_text', text: '{"cv":" ","coverLetter":"letter"}' }
          ]
        }
      ]
    },
    {
      output: [
        {
          content: [
            {
              type: 'output_text',
              text: '{"cv":"CV","coverLetter":"letter","extra":true}'
            }
          ]
        }
      ]
    }
  ])(
    'rejects incomplete or malformed output without returning documents',
    async (payload) => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify(payload)));
      await expect(
        new HrGeneratorService(config).generate(sources)
      ).rejects.toMatchObject({ status: 422 });
    }
  );

  it('reports unavailable configuration before calling AI', async () => {
    const request = jest.spyOn(global, 'fetch');
    await expect(
      new HrGeneratorService(new ConfigService({})).generate(sources)
    ).rejects.toMatchObject({ status: 503 });
    expect(request).not.toHaveBeenCalled();
  });

  it('does not expose upstream response bodies on provider failure', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response('private provider detail', { status: 429 })
      );
    await expect(
      new HrGeneratorService(config).generate(sources)
    ).rejects.toThrow('HR AI provider is unavailable');
  });
});
