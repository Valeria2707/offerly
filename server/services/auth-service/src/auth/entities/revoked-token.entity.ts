import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'revoked_tokens' })
export class RevokedToken {
  @PrimaryColumn({ type: 'uuid' })
  jti!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'revoked_at', type: 'timestamptz' })
  revokedAt!: Date;
}
