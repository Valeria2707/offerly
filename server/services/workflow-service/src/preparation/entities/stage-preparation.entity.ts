import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { WorkflowStage } from '../../workflow/entities/workflow-stage.entity';
import { PreparationTarget } from '../preparation.enums';
import { PreparationSources } from '../preparation.types';

@Entity({ name: 'stage_preparations' })
@Unique(['stageId', 'version'])
export class StagePreparation {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'stage_id', type: 'uuid' }) stageId!: string;
  @ManyToOne(() => WorkflowStage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage!: WorkflowStage;
  @Column({ type: 'integer' }) version!: number;
  @Column({ type: 'text' }) cv!: string;
  @Column({ name: 'cover_letter', type: 'text' }) coverLetter!: string;
  @Column({ type: 'text', nullable: true }) prompt!: string | null;
  @Column({ type: 'enum', enum: PreparationTarget }) target!: PreparationTarget;
  @Column({ type: 'jsonb', select: false }) sources!: PreparationSources;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
