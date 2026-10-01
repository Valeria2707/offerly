import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StageType } from '../stage-type/entities/stage-type.entity';
import { ApplicationWorkflow } from './entities/application-workflow.entity';
import { StageNote } from './entities/stage-note.entity';
import { WorkflowStage } from './entities/workflow-stage.entity';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationWorkflow,
      WorkflowStage,
      StageNote,
      StageType
    ])
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService]
})
export class WorkflowModule {}
