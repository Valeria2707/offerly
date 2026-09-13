import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { StageCategory, StageStatus } from '../workflow.enums';
import { ApplicationWorkflow } from './application-workflow.entity';
@Entity({ schema: 'workflow', name: 'workflow_stages' })
export class WorkflowStage {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'workflow_id', type: 'uuid' }) workflowId!: string;
  @ManyToOne(() => ApplicationWorkflow, (workflow) => workflow.stages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'workflow_id' })
  workflow!: ApplicationWorkflow;
  @Column({ name: 'stage_type_id', type: 'uuid' }) stageTypeId!: string;
  @Column({ name: 'name_snapshot', type: 'varchar', length: 200 })
  name!: string;
  @Column({ name: 'category_snapshot', type: 'enum', enum: StageCategory })
  category!: StageCategory;
  @Column({ type: 'integer' }) position!: number;
  @Column({ name: 'is_required', default: true }) isRequired!: boolean;
  @Column({ type: 'enum', enum: StageStatus, default: StageStatus.NOT_STARTED })
  status!: StageStatus;
  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;
  @Column({ name: 'deadline_at', type: 'timestamptz', nullable: true })
  deadlineAt!: Date | null;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
  @Column({ type: 'text', nullable: true }) note!: string | null;
  @Column({
    name: 'artifact_url',
    type: 'varchar',
    length: 2048,
    nullable: true
  })
  artifactUrl!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
