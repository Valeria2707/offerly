import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { WorkflowStage } from './workflow-stage.entity';
@Entity({ schema: 'workflow', name: 'application_workflows' })
export class ApplicationWorkflow {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'vacancy_id', type: 'uuid', unique: true })
  vacancyId!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @OneToMany(() => WorkflowStage, (stage) => stage.workflow)
  stages!: WorkflowStage[];
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
