import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowModule } from '../workflow/workflow.module';
import { StageNote } from './entities/stage-note.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [WorkflowModule, TypeOrmModule.forFeature([StageNote])],
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule {}
