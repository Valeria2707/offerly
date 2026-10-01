import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { WorkflowStage } from './workflow-stage.entity';

@Entity({ schema: 'workflow', name: 'stage_notes' })
@Index('IDX_stage_notes_stage_created', ['stageId', 'createdAt'])
export class StageNote {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'stage_id', type: 'uuid' }) stageId!: string;
  @ManyToOne(() => WorkflowStage, (stage) => stage.notes, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'stage_id',
    foreignKeyConstraintName: 'FK_stage_note_stage'
  })
  stage!: WorkflowStage;
  @Column({ type: 'text' }) content!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
