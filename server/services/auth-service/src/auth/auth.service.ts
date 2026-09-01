import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { AuditProducerService } from './audit-producer.service';
import { JwtPayload } from './auth.types';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ProfileResponseDto } from './dto/auth-response.dto';
import { TokenRevocationService } from './token-revocation.service';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly revocations: TokenRevocationService,
    private readonly audit: AuditProducerService
  ) {}

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(credentials.email);
    const valid = user?.isActive && (await compare(credentials.password, user.passwordHash));
    if (!user || !valid) throw new UnauthorizedException('Invalid username or password');

    const expiresIn = this.parseExpiry(this.config.getOrThrow<string>('JWT_EXPIRES_IN'));
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name, jti: randomUUID() };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn });
    await this.audit.publish('identity.auth.login.v1', payload.sub);
    return { accessToken, tokenType: 'Bearer', expiresIn };
  }

  async register(input: RegisterDto): Promise<ProfileResponseDto> {
    const user = await this.users.create(input);
    await this.audit.publish('identity.user.registered.v1', user.id);
    return { id: user.id, name: user.name, email: user.email };
  }

  async logout(user: JwtPayload): Promise<void> {
    if (!user.exp) throw new UnauthorizedException('Token has no expiration');
    await this.revocations.revoke(user.jti, user.exp, user.sub);
    await this.audit.publish('identity.auth.logout.v1', user.sub);
  }

  private parseExpiry(value: string): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(value);
    if (!match) throw new Error('JWT_EXPIRES_IN must look like 30s, 15m, 1h, or 1d');
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
  }

}
