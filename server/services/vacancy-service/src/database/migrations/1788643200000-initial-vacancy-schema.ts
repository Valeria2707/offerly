import { MigrationInterface, QueryRunner } from 'typeorm';
export class InitialVacancySchema1788643200000 implements MigrationInterface {
  name = 'InitialVacancySchema1788643200000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "vacancy"');
    await queryRunner.query(
      "CREATE TYPE \"vacancy\".\"vacancy_status\" AS ENUM ('saved', 'applied', 'hr', 'interview', 'technical', 'final', 'offer', 'rejected', 'closed')"
    );
    await queryRunner.query(`CREATE TABLE "vacancy"."vacancies" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL,
      "title" varchar(300) NOT NULL, "company" varchar(300) NOT NULL, "location" varchar(500),
      "work_format" varchar(100), "employment_type" varchar(100), "level" varchar(100), "salary_range" varchar(200),
      "posted_at" date, "description" text, "required_skills" text[] NOT NULL DEFAULT '{}',
      "preferred_skills" text[] NOT NULL DEFAULT '{}', "experience_requirement" text, "education_requirement" text,
      "language_requirements" text[] NOT NULL DEFAULT '{}', "source_url" varchar(2048),
      "status" "vacancy"."vacancy_status" NOT NULL DEFAULT 'saved', "next_step" text,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_vacancies" PRIMARY KEY ("id"))`);
    await queryRunner.query(
      'CREATE INDEX "IDX_vacancies_user_updated" ON "vacancy"."vacancies" ("user_id", "updated_at")'
    );
    await queryRunner.query(`CREATE TABLE "vacancy"."vacancy_imports" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "source_url" varchar(2048),
      "draft" jsonb NOT NULL, "applied_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_vacancy_imports" PRIMARY KEY ("id"))`);
    await queryRunner.query(
      'CREATE INDEX "IDX_vacancy_imports_user" ON "vacancy"."vacancy_imports" ("user_id")'
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "vacancy"."vacancy_imports"');
    await queryRunner.query('DROP TABLE "vacancy"."vacancies"');
    await queryRunner.query('DROP TYPE "vacancy"."vacancy_status"');
    await queryRunner.query('DROP SCHEMA "vacancy"');
  }
}
