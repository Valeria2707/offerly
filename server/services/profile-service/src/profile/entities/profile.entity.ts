import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn
} from 'typeorm';
import { ProfileData } from '../profile.types';

@Entity({ schema: 'profile', name: 'profiles' })
@Unique('UQ_profile_profiles_user_id', ['userId'])
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'jsonb' })
  data!: ProfileData;

  @VersionColumn({ default: 1 })
  version!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
