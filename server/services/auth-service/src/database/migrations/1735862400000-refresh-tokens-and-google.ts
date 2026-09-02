import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshTokensAndGoogle1735862400000 implements MigrationInterface {
  name = 'RefreshTokensAndGoogle1735862400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL');
    await queryRunner.query('ALTER TABLE "users" ADD "google_id" varchar(255)');
    await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")');
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" varchar(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "replaced_by_token_hash" varchar(64),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")');
    await queryRunner.query('CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "refresh_tokens"');
    await queryRunner.query('ALTER TABLE "users" DROP CONSTRAINT "UQ_users_google_id"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "google_id"');
    await queryRunner.query('DELETE FROM "users" WHERE "password_hash" IS NULL');
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL');
  }
}
