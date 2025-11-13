import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmployeesTable1699123456790 implements MigrationInterface {
  name = 'CreateEmployeesTable1699123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "phone" character varying,
        "position" character varying,
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employees_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_employees_user" FOREIGN KEY ("userId") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_employees_userId" ON "employees" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employees"`);
  }
}
