import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, IsNull, Repository } from 'typeorm';
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
    const service = new RefreshTokenService(
      repository,
      config,
      {} as DataSource
    );

    const rawToken = await service.issue(
      '16046d70-825d-4e38-a9f6-3c412ea70923'
    );

    expect(rawToken.length).toBeGreaterThan(40);
    expect(saved[0].tokenHash).not.toBe(rawToken);
    expect(saved[0].tokenHash).toHaveLength(64);
  });

  it('revokes every session when an already used token comes back', async () => {
    const update = jest.fn().mockResolvedValue({ affected: 2 });
    const used = {
      userId: 'user',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000)
    };
    const manager = {
      getRepository: (): { findOne: jest.Mock } => ({
        findOne: jest.fn().mockResolvedValue(used)
      })
    };
    const dataSource = {
      transaction: (run: (value: typeof manager) => unknown): unknown =>
        run(manager)
    };
    const service = new RefreshTokenService(
      { update } as unknown as Repository<RefreshToken>,
      { getOrThrow: jest.fn() } as unknown as ConfigService,
      dataSource as unknown as DataSource
    );

    await expect(service.rotate('leaked-token')).rejects.toThrow(
      UnauthorizedException
    );
    expect(update).toHaveBeenCalledWith(
      { userId: 'user', revokedAt: IsNull() },
      { revokedAt: expect.any(Date) }
    );
  });
});
