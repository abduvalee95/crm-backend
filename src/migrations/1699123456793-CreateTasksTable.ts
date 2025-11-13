import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1699123456793 implements MigrationInterface {
  name = 'CreateTasksTable1699123456793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'pending',
        "dueDate" date,
        "assigned_to" uuid,
        "client_id" uuid,
        "deal_id" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_assigned_to" FOREIGN KEY ("assigned_to") 
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_client" FOREIGN KEY ("client_id") 
          REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_deal" FOREIGN KEY ("deal_id") 
          REFERENCES "deals"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_assigned_to" ON "tasks" ("assigned_to")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_client" ON "tasks" ("client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_deal" ON "tasks" ("deal_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_deal"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_client"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_assigned_to"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_status_enum"`);
  }
}
