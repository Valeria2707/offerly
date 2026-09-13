import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkflowOutbox1789250000000 implements MigrationInterface {
  name = 'WorkflowOutbox1789250000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "vacancy"."vacancies_lifecycle_enum" AS ENUM ('active','archived','closed')`
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy"."vacancies" ADD "lifecycle" "vacancy"."vacancies_lifecycle_enum" NOT NULL DEFAULT 'active'`
    );
    await queryRunner.query(
      `UPDATE "vacancy"."vacancies" SET "lifecycle" = 'closed' WHERE "status" = 'closed'`
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy"."vacancies" DROP COLUMN "next_step"`
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy"."vacancies" DROP COLUMN "status"`
    );
    await queryRunner.query(`DROP TYPE "vacancy"."vacancy_status"`);
    await queryRunner.query(`CREATE TABLE "vacancy"."outbox_events" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregate_id" uuid NOT NULL,
      "event_type" character varying(200) NOT NULL, "payload" jsonb NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "published_at" TIMESTAMP WITH TIME ZONE, "attempts" integer NOT NULL DEFAULT 0,
      CONSTRAINT "PK_vacancy_outbox_events" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_vacancy_outbox_pending" ON "vacancy"."outbox_events" ("created_at") WHERE "published_at" IS NULL`
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vacancy"."outbox_events"`);
    await queryRunner.query(
      `CREATE TYPE "vacancy"."vacancy_status" AS ENUM ('saved','applied','hr','interview','technical','final','offer','rejected','closed')`
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy"."vacancies" ADD "status" "vacancy"."vacancy_status" NOT NULL DEFAULT 'saved'`
    );
    await queryRunner.query(
      `UPDATE "vacancy"."vacancies" SET "status" = 'closed' WHERE "lifecycle" = 'closed'`
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy"."vacancies" ADD "next_step" text`
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy"."vacancies" DROP COLUMN "lifecycle"`
    );
    await queryRunner.query(`DROP TYPE "vacancy"."vacancies_lifecycle_enum"`);
  }
}
