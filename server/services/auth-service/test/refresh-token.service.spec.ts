import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { RefreshTokenService } from '../src/auth/refresh-token.service';

describe('RefreshTokenService', () => {
  it('stores only a hash when issuing a refresh token', async () => {
    const saved: RefreshToken[] = [];
    const repository = {
      create: jest.fn((value: RefreshToken) => value),
      save: jest.fn(async (value: RefreshToken) => {
        saved.push(value);
        return value;
      })
    } as unknown as Repository<RefreshToken>;
    const config = {
      getOrThrow: jest.fn().mockReturnValue(30)
    } as unknown as ConfigService;
    const service = new RefreshTokenService(repository, config, {} as DataSource);

    const rawToken = await service.issue('16046d70-825d-4e38-a9f6-3c412ea70923');

    expect(rawToken.length).toBeGreaterThan(40);
    expect(saved[0].tokenHash).not.toBe(rawToken);
    expect(saved[0].tokenHash).toHaveLength(64);
  });
});
