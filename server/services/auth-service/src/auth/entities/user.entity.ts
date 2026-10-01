import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'users' })
@Unique('UQ_users_email', ['email'])
@Unique('UQ_users_google_id', ['googleId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  passwordHash!: string | null;

  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  googleId!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
