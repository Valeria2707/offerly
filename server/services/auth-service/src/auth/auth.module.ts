import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditProducerService } from './audit-producer.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TokenRevocationService } from './token-revocation.service';
import { RevokedToken } from './entities/revoked-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { MailService } from './mail.service';
import { PasswordResetService } from './password-reset.service';
import { RefreshTokenService } from './refresh-token.service';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, RevokedToken, PasswordResetToken, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { issuer: 'auth-service', audience: 'microservices-api' }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenRevocationService, AuditProducerService, UsersService, MailService, PasswordResetService, RefreshTokenService, GoogleAuthService]
})
export class AuthModule {}
