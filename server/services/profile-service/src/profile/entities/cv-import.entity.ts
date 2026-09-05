import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CvImportStatus } from '../enums/cv-import-status.enum';
import { ProfileData } from '../profile.types';

@Entity({ schema: 'profile', name: 'cv_imports' })
export class CvImport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ name: 'content_sha256', type: 'char', length: 64 })
  contentSha256!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: CvImportStatus;

  @Column({ name: 'draft_data', type: 'jsonb', nullable: true })
  draftData!: ProfileData | null;

  @Column({ name: 'model_name', type: 'varchar', length: 100, nullable: true })
  modelName!: string | null;

  @Column({ name: 'schema_version', type: 'varchar', length: 20, default: '1.0' })
  schemaVersion!: string;

  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode!: string | null;

  @Column({ name: 'applied_at', type: 'timestamptz', nullable: true })
  appliedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
