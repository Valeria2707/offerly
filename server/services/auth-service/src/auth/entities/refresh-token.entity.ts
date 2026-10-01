import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'refresh_tokens' })
@Unique('UQ_refresh_token_hash', ['tokenHash'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('IDX_refresh_tokens_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_refresh_tokens_user'
  })
  user!: User;

  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash!: string;

  @Index('IDX_refresh_tokens_expires_at')
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({
    name: 'replaced_by_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true
  })
  replacedByTokenHash!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
