import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpstreamModule } from '../upstream/upstream.module';
import { ApplicationWorkflow } from '../workflow/entities/application-workflow.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
@Module({
  imports: [TypeOrmModule.forFeature([ApplicationWorkflow]), UpstreamModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}
