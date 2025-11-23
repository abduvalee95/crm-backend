import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTelegramSettingsTable1699123456795 implements MigrationInterface {
  name = 'CreateTelegramSettingsTable1699123456795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "telegram_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "botToken" character varying,
        "defaultChatId" character varying,
        "enabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_telegram_settings_id" PRIMARY KEY ("id")
      )
    `);

    // Faqat bitta sozlama bo'lishi uchun constraint
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_telegram_settings_single" ON "telegram_settings" ((1))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_telegram_settings_single"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "telegram_settings"`);
  }
}