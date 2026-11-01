import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedAuthModule } from '@offerly/auth';
import { AiOperation, OutboxEvent, OutboxModule } from '@offerly/nest-common';
import * as Joi from 'joi';
import { SERVICE_NAME } from './app.constants';
import { createDataSourceWithSchema } from './database/create-data-source';
import { HealthController } from './health.controller';
import { VacancyImport } from './vacancy/entities/vacancy-import.entity';
import { Vacancy } from './vacancy/entities/vacancy.entity';
import { VacancyModule } from './vacancy/vacancy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3003),
        JWT_SECRET: Joi.string().min(32).required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().min(8).required(),
        KAFKA_BROKERS: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().allow('').default(''),
        OPENAI_MODEL: Joi.string().allow('').default(''),
        APP_BASE_URL: Joi.string().uri().required(),
        SWAGGER_ENABLED: Joi.boolean().default(false)
      }).custom((env: Record<string, string>) => {
        if (Boolean(env.OPENAI_API_KEY) !== Boolean(env.OPENAI_MODEL))
          throw new Error(
            'Set both OPENAI_API_KEY and OPENAI_MODEL or neither'
          );
        return env;
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
        schema: 'vacancy',
        entities: [Vacancy, VacancyImport, OutboxEvent, AiOperation],
        synchronize: true
      }),
      dataSourceFactory: (options) =>
        createDataSourceWithSchema(options!, 'vacancy')
    }),
    SharedAuthModule,
    VacancyModule,
    OutboxModule.register(SERVICE_NAME)
  ],
  controllers: [HealthController]
})
export class AppModule {}
