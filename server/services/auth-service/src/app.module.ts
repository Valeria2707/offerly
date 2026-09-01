import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { RevokedToken } from './auth/entities/revoked-token.entity';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';
import { User } from './auth/entities/user.entity';
import { HealthController } from './health.controller';
import { InitialSchema1735689600000 } from './database/migrations/1735689600000-initial-schema';
import { UserEmailAndPasswordReset1735776000000 } from './database/migrations/1735776000000-user-email-and-password-reset';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        AUTH_NAME: Joi.string().min(1).default('Admin'),
        AUTH_EMAIL: Joi.string().email().default('admin@example.com'),
        AUTH_PASSWORD: Joi.string().min(8).required(),
        KAFKA_BROKERS: Joi.string().default('kafka:9092'),
        SWAGGER_ENABLED: Joi.boolean().default(false),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().min(8).required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().port().default(1025),
        SMTP_SECURE: Joi.boolean().default(false),
        SMTP_FROM: Joi.string().required(),
        SMTP_USER: Joi.string().allow('').default(''),
        SMTP_PASSWORD: Joi.string().allow('').default(''),
        APP_BASE_URL: Joi.string().uri().required()
      })
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DATABASE_HOST'),
        port: config.getOrThrow<number>('DATABASE_PORT'),
        database: config.getOrThrow<string>('DATABASE_NAME'),
        username: config.getOrThrow<string>('DATABASE_USER'),
        password: config.getOrThrow<string>('DATABASE_PASSWORD'),
        entities: [User, RevokedToken, PasswordResetToken],
        migrations: [InitialSchema1735689600000, UserEmailAndPasswordReset1735776000000],
        migrationsRun: true,
        synchronize: false
      })
    }),
    AuthModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
