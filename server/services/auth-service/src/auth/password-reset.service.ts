import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { calculateSha256, MINUTE_MS } from '@offerly/helpers';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import {
  PASSWORD_RESET_TOKEN_BYTES,
  PASSWORD_RESET_TTL_MINUTES
} from './auth.constants';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from './entities/user.entity';
import { MailService } from './mail.service';
import { RefreshTokenService } from './refresh-token.service';
import { hashPassword, UsersService } from './users.service';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokens: Repository<PasswordResetToken>,
    private readonly users: UsersService,
    private readonly mail: MailService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly dataSource: DataSource
  ) {}

  async request(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;

    await this.tokens.delete({ userId: user.id, usedAt: IsNull() });
    const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
    await this.tokens.save(
      this.tokens.create({
        userId: user.id,
        tokenHash: calculateSha256(token),
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TTL_MINUTES * MINUTE_MS
        ),
        usedAt: null
      })
    );
    await this.mail.sendPasswordReset(user.email, user.name, token);
  }

  async reset(token: string, password: string): Promise<void> {
    const passwordHash = await hashPassword(password);
    const userId = await this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(PasswordResetToken, {
        where: {
          tokenHash: calculateSha256(token),
          usedAt: IsNull(),
          expiresAt: MoreThan(new Date())
        },
        lock: { mode: 'pessimistic_write' }
      });
      if (!record)
        throw new BadRequestException('Reset token is invalid or expired');
      await manager.update(User, { id: record.userId }, { passwordHash });
      await manager.update(
        PasswordResetToken,
        { id: record.id },
        { usedAt: new Date() }
      );
      return record.userId;
    });
    await this.refreshTokens.revokeAll(userId);
  }
}
