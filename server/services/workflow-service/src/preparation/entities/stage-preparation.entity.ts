import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { WorkflowStage } from '../../workflow/entities/workflow-stage.entity';
import { PreparationData } from '../preparation.types';
@Entity({ schema: 'workflow', name: 'stage_preparations' })
export class StagePreparationData {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'stage_id', type: 'uuid', unique: true }) stageId!: string;
  @OneToOne(() => WorkflowStage, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'stage_id',
    foreignKeyConstraintName: 'FK_stage_preparation_stage'
  })
  stage!: WorkflowStage;
  @Column({ type: 'jsonb' }) data!: PreparationData;
  @Column({ type: 'text', nullable: true }) instructions!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
