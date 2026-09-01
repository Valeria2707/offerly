import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { RevokedToken } from './entities/revoked-token.entity';

@Injectable()
export class TokenRevocationService {
  constructor(
    @InjectRepository(RevokedToken)
    private readonly revokedTokens: Repository<RevokedToken>
  ) {}

  async revoke(jti: string, expiresAt: number, userId: string): Promise<void> {
    await this.removeExpired();
    await this.revokedTokens.upsert(
      { jti, userId, expiresAt: new Date(expiresAt * 1000) },
      { conflictPaths: ['jti'] }
    );
  }

  async isRevoked(jti: string): Promise<boolean> {
    await this.removeExpired();
    return (await this.revokedTokens.countBy({ jti })) > 0;
  }

  private async removeExpired(): Promise<void> {
    await this.revokedTokens.delete({ expiresAt: LessThanOrEqual(new Date()) });
  }
}
