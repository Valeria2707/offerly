import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'revoked_tokens' })
export class RevokedToken {
  @PrimaryColumn({ type: 'uuid' })
  jti!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_revoked_tokens_user'
  })
  user!: User;

  @Index('IDX_revoked_tokens_expires_at')
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'revoked_at', type: 'timestamptz' })
  revokedAt!: Date;
}
