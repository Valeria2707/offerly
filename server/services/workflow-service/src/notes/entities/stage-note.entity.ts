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
import { WorkflowStage } from '../../workflow/entities/workflow-stage.entity';

@Entity({ name: 'stage_notes' })
export class StageNote {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index()
  @Column({ name: 'stage_id', type: 'uuid' })
  stageId!: string;
  @ManyToOne(() => WorkflowStage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage!: WorkflowStage;
  @Column({ type: 'text' }) content!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
