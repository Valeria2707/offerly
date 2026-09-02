import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class GoogleAuthService {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: ConfigService, private readonly users: UsersService) {}

  async authenticate(idToken: string): Promise<User> {
    const audience = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!audience) throw new ServiceUnavailableException('Google authentication is not configured');

    const ticket = await this.client.verifyIdToken({ idToken, audience }).catch(() => null);
    const payload = ticket?.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Google token is invalid');
    }
    return this.users.findOrCreateGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0]
    });
  }
}
