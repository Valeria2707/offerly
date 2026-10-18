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

@Entity({ schema: 'workflow', name: 'stage_questions' })
@Index('IDX_stage_questions_stage_created', ['stageId', 'createdAt'])
export class StageQuestion {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'stage_id', type: 'uuid' }) stageId!: string;
  @ManyToOne(() => WorkflowStage, (stage) => stage.questions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'stage_id',
    foreignKeyConstraintName: 'FK_stage_question_stage'
  })
  stage!: WorkflowStage;
  @Column({ type: 'text' }) question!: string;
  @Column({ type: 'text', nullable: true }) answer!: string | null;
  @Column({ name: 'was_hard', default: false }) wasHard!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
