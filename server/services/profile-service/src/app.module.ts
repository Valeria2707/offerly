import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { InitialProfileSchema1788384000000 } from './database/migrations/1788384000000-initial-profile-schema';
import { HealthController } from './health.controller';
import { CvImport } from './profile/entities/cv-import.entity';
import { Profile } from './profile/entities/profile.entity';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().port().default(3002),
        JWT_SECRET: Joi.string().min(32).required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().min(8).required(),
        OPENAI_API_KEY: Joi.string().allow('').default(''),
        OPENAI_MODEL: Joi.string().allow('').default(''),
        CV_MAX_EXTRACTED_CHARACTERS: Joi.number().integer().min(10_000).max(500_000).default(100_000),
        APP_BASE_URL: Joi.string().uri().required(),
        SWAGGER_ENABLED: Joi.boolean().default(false)
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
        entities: [Profile, CvImport],
        migrations: [InitialProfileSchema1788384000000],
        migrationsRun: true,
        synchronize: false
      })
    }),
    AuthModule,
    ProfileModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
