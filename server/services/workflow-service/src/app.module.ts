import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedAuthModule } from '@offerly/auth';
import { InitialWorkflowSchema1789251000000 } from './database/migrations/1789251000000-initial-workflow-schema';
import { HealthController } from './health.controller';
import { EventsModule } from './events/events.module';
import { StageType } from './stage-type/entities/stage-type.entity';
import { StageTypeModule } from './stage-type/stage-type.module';
import { ApplicationWorkflow } from './workflow/entities/application-workflow.entity';
import { WorkflowStage } from './workflow/entities/workflow-stage.entity';
import { WorkflowModule } from './workflow/workflow.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres',
        host: c.getOrThrow<string>('DATABASE_HOST'),
        port: c.get<number>('DATABASE_PORT', 5432),
        database: c.getOrThrow<string>('DATABASE_NAME'),
        username: c.getOrThrow<string>('DATABASE_USER'),
        password: c.getOrThrow<string>('DATABASE_PASSWORD'),
        entities: [StageType, ApplicationWorkflow, WorkflowStage],
        migrations: [InitialWorkflowSchema1789251000000],
        migrationsRun: true,
        synchronize: false
      })
    }),
    SharedAuthModule,
    StageTypeModule,
    WorkflowModule,
    EventsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
