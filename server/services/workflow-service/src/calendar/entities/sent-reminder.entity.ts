import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ReminderKind } from '../calendar.enums';

@Entity({ schema: 'workflow', name: 'sent_reminders' })
@Index('UQ_sent_reminders_key', ['userId', 'kind', 'subjectId'], {
  unique: true
})
export class SentReminder {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'enum', enum: ReminderKind, enumName: 'reminder_kind_enum' })
  kind!: ReminderKind;
  @Column({ name: 'subject_id', type: 'varchar', length: 64 })
  subjectId!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
