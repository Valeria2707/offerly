import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { StageCategory } from '../../workflow/workflow.enums';
@Entity({ schema: 'workflow', name: 'stage_types' })
export class StageType {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId!: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  code!: string | null;
  @Column({ type: 'varchar', length: 200 }) name!: string;
  @Column({ type: 'enum', enum: StageCategory }) category!: StageCategory;
  @Column({
    name: 'expected_duration_minutes',
    type: 'integer',
    nullable: true
  })
  expectedDurationMinutes!: number | null;
  @Column({ name: 'requires_preparation', default: false })
  requiresPreparation!: boolean;
  @Column({ name: 'supports_deadline', default: false })
  supportsDeadline!: boolean;
  @Column({ name: 'produces_artifact', default: false })
  producesArtifact!: boolean;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
