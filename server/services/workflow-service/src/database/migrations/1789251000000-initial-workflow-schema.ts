import { MigrationInterface, QueryRunner } from 'typeorm';
export class InitialWorkflowSchema1789251000000 implements MigrationInterface {
  name = 'InitialWorkflowSchema1789251000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`CREATE SCHEMA IF NOT EXISTS "workflow"`);
    await q.query(
      `CREATE TYPE "workflow"."stage_category_enum" AS ENUM ('screening','technical','behavioral','administrative')`
    );
    await q.query(
      `CREATE TYPE "workflow"."stage_status_enum" AS ENUM ('not_started','scheduled','in_progress','awaiting_result','completed','cancelled','skipped')`
    );
    await q.query(
      `CREATE TABLE "workflow"."stage_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"owner_user_id" uuid,"code" varchar(100),"name" varchar(200) NOT NULL,"category" "workflow"."stage_category_enum" NOT NULL,"expected_duration_minutes" integer,"requires_preparation" boolean NOT NULL DEFAULT false,"supports_deadline" boolean NOT NULL DEFAULT false,"produces_artifact" boolean NOT NULL DEFAULT false,"is_active" boolean NOT NULL DEFAULT true,"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),CONSTRAINT "UQ_workflow_stage_type_code" UNIQUE("code"),CONSTRAINT "PK_workflow_stage_types" PRIMARY KEY("id"))`
    );
    await q.query(
      `CREATE TABLE "workflow"."application_workflows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"vacancy_id" uuid NOT NULL,"user_id" uuid NOT NULL,"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),CONSTRAINT "UQ_workflow_vacancy" UNIQUE("vacancy_id"),CONSTRAINT "PK_application_workflows" PRIMARY KEY("id"))`
    );
    await q.query(
      `CREATE TABLE "workflow"."workflow_stages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"workflow_id" uuid NOT NULL,"stage_type_id" uuid NOT NULL,"name_snapshot" varchar(200) NOT NULL,"category_snapshot" "workflow"."stage_category_enum" NOT NULL,"position" integer NOT NULL,"is_required" boolean NOT NULL DEFAULT true,"status" "workflow"."stage_status_enum" NOT NULL DEFAULT 'not_started',"scheduled_at" timestamptz,"deadline_at" timestamptz,"completed_at" timestamptz,"note" text,"artifact_url" varchar(2048),"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),CONSTRAINT "PK_workflow_stages" PRIMARY KEY("id"),CONSTRAINT "FK_workflow_stage_workflow" FOREIGN KEY("workflow_id") REFERENCES "workflow"."application_workflows"("id") ON DELETE CASCADE,CONSTRAINT "FK_workflow_stage_type" FOREIGN KEY("stage_type_id") REFERENCES "workflow"."stage_types"("id") ON DELETE RESTRICT)`
    );
    const values = [
      ['submitted', 'Submitted', 'administrative', null, false, false, false],
      ['hr_screening', 'HR screening', 'screening', 30, true, false, false],
      [
        'pre_tech_screening',
        'Pre-tech screening',
        'screening',
        30,
        true,
        false,
        false
      ],
      ['test_task', 'Test task', 'technical', null, true, true, true],
      [
        'technical_interview',
        'Technical interview',
        'technical',
        60,
        true,
        false,
        false
      ],
      ['live_coding', 'Live coding', 'technical', 60, true, false, true],
      ['system_design', 'System Design', 'technical', 60, true, false, false],
      [
        'team_interview',
        'Team interview',
        'behavioral',
        45,
        true,
        false,
        false
      ],
      ['culture_fit', 'Culture fit', 'behavioral', 30, false, false, false],
      [
        'final_interview',
        'Final interview',
        'behavioral',
        45,
        true,
        false,
        false
      ],
      [
        'offer_negotiation',
        'Offer negotiation',
        'administrative',
        null,
        false,
        true,
        false
      ],
      ['offer', 'Offer', 'administrative', null, false, true, true],
      ['rejection', 'Rejection', 'administrative', null, false, false, false]
    ];
    for (const [
      code,
      name,
      category,
      duration,
      prep,
      deadline,
      artifact
    ] of values)
      await q.query(
        `INSERT INTO "workflow"."stage_types"("code","name","category","expected_duration_minutes","requires_preparation","supports_deadline","produces_artifact") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [code, name, category, duration, prep, deadline, artifact]
      );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP SCHEMA "workflow" CASCADE`);
  }
}
