import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialProfileSchema1788384000000 implements MigrationInterface {
  name = 'InitialProfileSchema1788384000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "profile"');
    await queryRunner.query(`
      CREATE TABLE "profile"."profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "data" jsonb NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_profile_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_profile_profiles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "profile"."cv_imports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "original_filename" varchar(255) NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "content_sha256" char(64) NOT NULL,
        "status" varchar(20) NOT NULL,
        "draft_data" jsonb,
        "model_name" varchar(100),
        "schema_version" varchar(20) NOT NULL DEFAULT '1.0',
        "error_code" varchar(50),
        "applied_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_profile_cv_imports" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_profile_cv_imports_user_id_created_at" ON "profile"."cv_imports" ("user_id", "created_at")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "profile"."cv_imports"');
    await queryRunner.query('DROP TABLE "profile"."profiles"');
    await queryRunner.query('DROP SCHEMA "profile"');
  }
}
