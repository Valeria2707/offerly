import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_AUDIENCE, JWT_ISSUER } from './auth.constants';
import { JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
