import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';
import { VacancyDraftData } from '../vacancy.types';
@Entity({ schema: 'vacancy', name: 'vacancy_imports' })
export class VacancyImport {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'source_url', type: 'varchar', length: 2048, nullable: true })
  sourceUrl!: string | null;
  @Column({ type: 'jsonb' }) draft!: VacancyDraftData;
  @Column({ name: 'applied_at', type: 'timestamptz', nullable: true })
  appliedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
