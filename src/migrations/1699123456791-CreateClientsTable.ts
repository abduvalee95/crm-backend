import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsTable1699123456791 implements MigrationInterface {
  name = 'CreateClientsTable1699123456791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "client_status_enum" AS ENUM('active', 'inactive', 'lead', 'prospect')
    `);

    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "phone" character varying,
        "email" character varying NOT NULL,
        "company" character varying,
        "messages" character varying,
        "status" "client_status_enum" NOT NULL DEFAULT 'lead',
        "created_by" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_clients_email" UNIQUE ("email"),
        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_clients_created_by" FOREIGN KEY ("created_by") 
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_clients_email" ON "clients" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_clients_created_by" ON "clients" ("created_by")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clients_created_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clients_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "client_status_enum"`);
  }
}
