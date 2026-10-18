import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sent_notifications' })
export class SentNotification {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' }) eventId!: string;
  @Column({ name: 'event_type', type: 'varchar', length: 200 })
  eventType!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
