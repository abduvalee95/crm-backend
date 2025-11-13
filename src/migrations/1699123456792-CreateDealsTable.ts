import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDealsTable1699123456792 implements MigrationInterface {
  name = 'CreateDealsTable1699123456792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "deal_stage_enum" AS ENUM('Новый', 'В работе', 'Закрыт')
    `);

    await queryRunner.query(`
      CREATE TABLE "deals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "amount" numeric(10,2) NOT NULL DEFAULT '0',
        "stage" "deal_stage_enum" NOT NULL DEFAULT 'Новый',
        "client_id" uuid NOT NULL,
        "assigned_to" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deals_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_deals_client" FOREIGN KEY ("client_id") 
          REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_deals_assigned_to" FOREIGN KEY ("assigned_to") 
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_deals_client" ON "deals" ("client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_deals_assigned_to" ON "deals" ("assigned_to")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_deals_assigned_to"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_deals_client"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deals"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "deal_stage_enum"`);
  }
}
