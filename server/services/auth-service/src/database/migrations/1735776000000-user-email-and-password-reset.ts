import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailAndPasswordReset1735776000000 implements MigrationInterface {
  name = 'UserEmailAndPasswordReset1735776000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" ADD "name" varchar(150)');
    await queryRunner.query('ALTER TABLE "users" ADD "email" varchar(255)');
    await queryRunner.query(`UPDATE "users" SET "name" = "username", "email" = lower("username") || '@local.invalid'`);
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")');
    await queryRunner.query('ALTER TABLE "users" DROP CONSTRAINT "UQ_users_username"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "username"');
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" varchar(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_password_reset_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_password_reset_user" ON "password_reset_tokens" ("user_id")');
    await queryRunner.query('CREATE INDEX "IDX_password_reset_expires" ON "password_reset_tokens" ("expires_at")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "password_reset_tokens"');
    await queryRunner.query('ALTER TABLE "users" ADD "username" varchar(100)');
    await queryRunner.query('UPDATE "users" SET "username" = split_part("email", \'@\', 1)');
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "UQ_users_username" UNIQUE ("username")');
    await queryRunner.query('ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "email"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "name"');
  }
}
