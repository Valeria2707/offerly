import { ServiceUnavailableException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AiLogService, AiOperation } from '@offerly/nest-common';

describe('AI operations log', () => {
  const insert = jest.fn();
  const log = new AiLogService({
    insert
  } as unknown as Repository<AiOperation>);
  beforeEach(() => insert.mockReset().mockResolvedValue(undefined));

  it('logs a successful call and returns its result', async () => {
    expect(
      await log.track('user', 'preparation', () => Promise.resolve('ok'))
    ).toBe('ok');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user',
        operation: 'preparation',
        success: true,
        error: null,
        durationMs: expect.any(Number)
      })
    );
  });
  it('logs a failed call and rethrows the same error', async () => {
    const error = new ServiceUnavailableException('Preparation AI unavailable');
    await expect(
      log.track('user', 'preparation', () => Promise.reject(error))
    ).rejects.toBe(error);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Preparation AI unavailable'
      })
    );
  });
  it('does not break the AI call when the log cannot be written', async () => {
    insert.mockRejectedValue(new Error('db down'));
    expect(
      await log.track('user', 'preparation', () => Promise.resolve('ok'))
    ).toBe('ok');
  });
});
