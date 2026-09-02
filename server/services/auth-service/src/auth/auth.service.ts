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
import { TokenRevocationService } from './token-revocation.service';
import { UsersService } from './users.service';
import { RefreshTokenService } from './refresh-token.service';
import { User } from './entities/user.entity';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly revocations: TokenRevocationService,
    private readonly audit: AuditProducerService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly googleAuth: GoogleAuthService
  ) {}

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(credentials.email);
    const valid = user?.isActive && user.passwordHash && (await compare(credentials.password, user.passwordHash));
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');

    const response = await this.createTokenPair(user);
    await this.audit.publish('identity.auth.login.v1', user.id);
    return response;
  }

  async register(input: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.users.create(input);
    await this.audit.publish('identity.user.registered.v1', user.id);
    return this.createTokenPair(user);
  }

  async authenticateWithGoogle(idToken: string): Promise<AuthResponseDto> {
    const user = await this.googleAuth.authenticate(idToken);
    await this.audit.publish('identity.auth.google-login.v1', user.id);
    return this.createTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const rotated = await this.refreshTokens.rotate(refreshToken);
    return this.createTokenPair(rotated.user, rotated.refreshToken);
  }

  async logout(user: JwtPayload): Promise<void> {
    if (!user.exp) throw new UnauthorizedException('Token has no expiration');
    await this.revocations.revoke(user.jti, user.exp, user.sub);
    await this.refreshTokens.revokeAll(user.sub);
    await this.audit.publish('identity.auth.logout.v1', user.sub);
  }

  private async createTokenPair(user: User, refreshToken?: string): Promise<AuthResponseDto> {
    const expiresIn = this.parseExpiry(this.config.getOrThrow<string>('JWT_EXPIRES_IN'));
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name, jti: randomUUID() };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn });
    return {
      accessToken,
      refreshToken: refreshToken ?? await this.refreshTokens.issue(user.id),
      tokenType: 'Bearer',
      expiresIn
    };
  }

  private parseExpiry(value: string): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(value);
    if (!match) throw new Error('JWT_EXPIRES_IN must look like 30s, 15m, 1h, or 1d');
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
  }

}
