import { Module } from '@nestjs/common';
import { SharedAuthModule } from '@offerly/auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialVacancySchema1788643200000 } from './database/migrations/1788643200000-initial-vacancy-schema';
import { HealthController } from './health.controller';
import { Vacancy } from './vacancy/entities/vacancy.entity';
import { VacancyImport } from './vacancy/entities/vacancy-import.entity';
import { VacancyModule } from './vacancy/vacancy.module';
import { WorkflowOutbox1789250000000 } from './database/migrations/1789250000000-workflow-outbox';
import { OutboxEvent } from './outbox/entities/outbox-event.entity';
import { OutboxModule } from './outbox/outbox.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT', 5432),
        database: config.getOrThrow<string>('DATABASE_NAME'),
        username: config.getOrThrow<string>('DATABASE_USER'),
        password: config.getOrThrow<string>('DATABASE_PASSWORD'),
        entities: [Vacancy, VacancyImport, OutboxEvent],
        migrations: [
          InitialVacancySchema1788643200000,
          WorkflowOutbox1789250000000
        ],
        migrationsRun: true,
        synchronize: false
      })
    }),
    SharedAuthModule,
    VacancyModule,
    OutboxModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
