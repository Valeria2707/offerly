import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { calculateSha256, DAY_MS } from '@offerly/helpers';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { REFRESH_TOKEN_BYTES } from './auth.constants';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';

type Rotation =
  { user: User; refreshToken: string } | { reusedBy: string } | null;

const newToken = (): string =>
  randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokens: Repository<RefreshToken>,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource
  ) {}

  async issue(userId: string): Promise<string> {
    const rawToken = newToken();
    await this.tokens.save(this.tokens.create(this.record(userId, rawToken)));
    return rawToken;
  }

  async rotate(
    rawToken: string
  ): Promise<{ user: User; refreshToken: string }> {
    const result = await this.dataSource.transaction((manager) =>
      this.rotateIn(manager, rawToken)
    );
    if (result && 'reusedBy' in result) await this.revokeAll(result.reusedBy);
    if (!result || 'reusedBy' in result)
      throw new UnauthorizedException('Refresh token is invalid or expired');
    return result;
  }

  async revokeAll(userId: string): Promise<void> {
    await this.tokens.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  private async rotateIn(
    manager: EntityManager,
    rawToken: string
  ): Promise<Rotation> {
    const repository = manager.getRepository(RefreshToken);
    const record = await repository.findOne({
      where: { tokenHash: calculateSha256(rawToken) },
      lock: { mode: 'pessimistic_write' }
    });
    if (!record) return null;
    if (record.revokedAt) return { reusedBy: record.userId };
    if (record.expiresAt <= new Date()) return null;
    const user = await manager
      .getRepository(User)
      .findOneBy({ id: record.userId });
    if (!user?.isActive) return null;

    const nextToken = newToken();
    await repository.save(
      repository.create(this.record(record.userId, nextToken))
    );
    record.revokedAt = new Date();
    record.replacedByTokenHash = calculateSha256(nextToken);
    await repository.save(record);
    return { user, refreshToken: nextToken };
  }

  private record(userId: string, rawToken: string): Partial<RefreshToken> {
    const days = this.config.getOrThrow<number>(
      'REFRESH_TOKEN_EXPIRES_IN_DAYS'
    );
    return {
      userId,
      tokenHash: calculateSha256(rawToken),
      expiresAt: new Date(Date.now() + days * DAY_MS),
      revokedAt: null,
      replacedByTokenHash: null
    };
  }
}
