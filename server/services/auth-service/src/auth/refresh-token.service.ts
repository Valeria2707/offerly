import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken) private readonly tokens: Repository<RefreshToken>,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource
  ) {}

  async issue(userId: string): Promise<string> {
    const rawToken = randomBytes(64).toString('base64url');
    const days = this.config.getOrThrow<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS');
    await this.tokens.save(this.tokens.create({
      userId,
      tokenHash: this.hash(rawToken),
      expiresAt: new Date(Date.now() + days * 86_400_000),
      revokedAt: null,
      replacedByTokenHash: null
    }));
    return rawToken;
  }

  async rotate(rawToken: string): Promise<{ user: User; refreshToken: string }> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(RefreshToken);
      const record = await repository.findOne({
        where: { tokenHash: this.hash(rawToken), revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
        lock: { mode: 'pessimistic_write' }
      });
      if (!record) throw new UnauthorizedException('Refresh token is invalid or expired');
      const user = await manager.getRepository(User).findOneBy({ id: record.userId });
      if (!user?.isActive) throw new UnauthorizedException('Refresh token is invalid or expired');

      const nextToken = randomBytes(64).toString('base64url');
      const days = this.config.getOrThrow<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS');
      await repository.save(repository.create({
        userId: record.userId,
        tokenHash: this.hash(nextToken),
        expiresAt: new Date(Date.now() + days * 86_400_000),
        revokedAt: null,
        replacedByTokenHash: null
      }));
      record.revokedAt = new Date();
      record.replacedByTokenHash = this.hash(nextToken);
      await repository.save(record);
      return { user, refreshToken: nextToken };
    });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.tokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
