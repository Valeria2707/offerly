import { ConfigService } from '@nestjs/config';
import { PreparationSourceService } from '../src/preparation/preparation-source.service';

describe('preparation sources', () => {
  afterEach(() => jest.restoreAllMocks());
  const service = new PreparationSourceService(new ConfigService({}));

  it('reads the authenticated profile and vacancy through separate APIs', async () => {
    const request = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              basics: { fullName: 'Candidate' },
              skills: [{ name: 'NestJS' }]
            }
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ title: 'Backend Engineer' }))
      );
    const sources = await service.load('vacancy-id', 'Bearer test');
    expect(sources.vacancy.title).toBe('Backend Engineer');
    expect(request.mock.calls.map(([url]) => String(url))).toEqual([
      'http://localhost:3002/api/v1/profile',
      'http://localhost:3003/api/v1/vacancies/vacancy-id'
    ]);
    for (const [, options] of request.mock.calls) {
      expect(options?.headers).toEqual({ Authorization: 'Bearer test' });
      expect(options?.redirect).toBe('error');
    }
  });

  it('rejects an empty profile', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { basics: {}, skills: [], experience: [], projects: [] }
          })
        )
      )
      .mockResolvedValueOnce(new Response('{"title":"Developer"}'));
    await expect(
      service.load('vacancy-id', 'Bearer test')
    ).rejects.toMatchObject({ status: 422 });
  });

  it('does not fall back to unauthenticated access on token expiry', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('', { status: 401 }));
    await expect(
      service.load('vacancy-id', 'Bearer expired')
    ).rejects.toMatchObject({ status: 401 });
  });
});
