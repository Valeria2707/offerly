import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JWT_AUDIENCE, JWT_ISSUER } from '@offerly/auth';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.types';
import { TokenRevocationService } from './token-revocation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly revocations: TokenRevocationService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (await this.revocations.isRevoked(payload.jti))
      throw new UnauthorizedException('Token has been revoked');
    return payload;
  }
}
