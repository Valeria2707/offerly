import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ schema: 'workflow', name: 'outbox_events' })
@Index('IDX_workflow_outbox_pending', ['createdAt'], {
  where: '"published_at" IS NULL'
})
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'aggregate_id', type: 'uuid' }) aggregateId!: string;
  @Column({ name: 'event_type', type: 'varchar', length: 200 })
  eventType!: string;
  @Column({ type: 'jsonb' }) payload!: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;
  @Column({ type: 'integer', default: 0 }) attempts!: number;
}
