import { AnalyticsModule } from './analytics/analytics.module';
import { CalendarModule } from './calendar/calendar.module';
import { ReminderSettings } from './calendar/entities/reminder-settings.entity';
import { SentReminder } from './calendar/entities/sent-reminder.entity';
import { PreparationModule } from './preparation/preparation.module';
import { StagePreparationData } from './preparation/entities/stage-preparation.entity';
import { StageNote } from './workflow/entities/stage-note.entity';
import { StageQuestion } from './workflow/entities/stage-question.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { SERVICE_NAME } from './app.constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedAuthModule } from '@offerly/auth';
import { AiOperation, OutboxEvent, OutboxModule } from '@offerly/nest-common';
import { createDataSourceWithSchema } from './database/create-data-source';
import { seedStageTypes } from './database/seed-stage-types';
import { HealthController } from './health.controller';
import { EventsModule } from './events/events.module';
import { StageType } from './stage-type/entities/stage-type.entity';
import { StageTypeModule } from './stage-type/stage-type.module';
import { ApplicationWorkflow } from './workflow/entities/application-workflow.entity';
import { WorkflowStage } from './workflow/entities/workflow-stage.entity';
import { WorkflowModule } from './workflow/workflow.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3004),
        JWT_SECRET: Joi.string().min(32).required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().min(8).required(),
        KAFKA_BROKERS: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().allow('').default(''),
        OPENAI_MODEL: Joi.string().allow('').default(''),
        VACANCY_SERVICE_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .required(),
        PROFILE_SERVICE_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .required(),
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
        schema: 'workflow',
        entities: [
          StageType,
          ApplicationWorkflow,
          WorkflowStage,
          StageNote,
          StageQuestion,
          StagePreparationData,
          ReminderSettings,
          SentReminder,
          OutboxEvent,
          AiOperation
        ],
        synchronize: true
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await createDataSourceWithSchema(
          options!,
          'workflow'
        );
        await seedStageTypes(dataSource);
        return dataSource;
      }
    }),
    SharedAuthModule,
    StageTypeModule,
    WorkflowModule,
    EventsModule,
    PreparationModule,
    CalendarModule,
    AnalyticsModule,
    OutboxModule.register(SERVICE_NAME)
  ],
  controllers: [HealthController]
})
export class AppModule {}
