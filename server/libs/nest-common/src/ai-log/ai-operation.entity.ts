import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';
import { AI_ERROR_MAX_LENGTH } from './ai-log.constants';

@Entity({ name: 'ai_operations' })
export class AiOperation {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', length: 40 }) operation!: string;
  @Column({ type: 'boolean' }) success!: boolean;
  @Column({ type: 'varchar', length: AI_ERROR_MAX_LENGTH, nullable: true })
  error!: string | null;
  @Column({ name: 'duration_ms', type: 'integer' }) durationMs!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
