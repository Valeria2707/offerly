import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { calculateSha256 } from '@offerly/helpers';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from './mail.service';
import { UsersService } from './users.service';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokens: Repository<PasswordResetToken>,
    private readonly users: UsersService,
    private readonly mail: MailService
  ) {}

  async request(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;

    await this.tokens.delete({ userId: user.id, usedAt: IsNull() });
    const token = randomBytes(32).toString('hex');
    await this.tokens.save(
      this.tokens.create({
        userId: user.id,
        tokenHash: calculateSha256(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        usedAt: null
      })
    );
    await this.mail.sendPasswordReset(user.email, user.name, token);
  }

  async reset(token: string, password: string): Promise<void> {
    const record = await this.tokens.findOne({
      where: {
        tokenHash: calculateSha256(token),
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      }
    });
    if (!record)
      throw new BadRequestException('Reset token is invalid or expired');

    await this.users.updatePassword(record.userId, password);
    record.usedAt = new Date();
    await this.tokens.save(record);
  }
}
