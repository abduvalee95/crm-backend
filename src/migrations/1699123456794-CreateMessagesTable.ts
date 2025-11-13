import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1699123456794 implements MigrationInterface {
  name = 'CreateMessagesTable1699123456794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "client_id" uuid,
        "employee_id" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_client" FOREIGN KEY ("client_id") 
          REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_messages_employee" FOREIGN KEY ("employee_id") 
          REFERENCES "employees"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_messages_client" ON "messages" ("client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_employee" ON "messages" ("employee_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_employee"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_client"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
  }
}
