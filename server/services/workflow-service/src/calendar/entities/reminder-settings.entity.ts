import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ schema: 'workflow', name: 'reminder_settings' })
export class ReminderSettings {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'email_enabled', default: false }) emailEnabled!: boolean;
  @Column({ name: 'before_interview', default: true })
  beforeInterview!: boolean;
  @Column({ name: 'after_stage', default: true }) afterStage!: boolean;
  @Column({ name: 'before_deadline', default: true }) beforeDeadline!: boolean;
  @Column({ default: true }) silence!: boolean;
  @Column({ name: 'weekly_digest', default: false }) weeklyDigest!: boolean;
  @Column({ name: 'quiet_from', type: 'varchar', length: 5, default: '22:00' })
  quietFrom!: string;
  @Column({ name: 'quiet_to', type: 'varchar', length: 5, default: '08:00' })
  quietTo!: string;
  @Column({
    name: 'calendar_token',
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: true
  })
  calendarToken!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
