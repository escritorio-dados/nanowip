import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Updatelinks1642696412290 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('links');

    await queryRunner.addColumns('links', [
      new TableColumn({
        name: 'active',
        type: 'boolean',
        default: true,
      }),
      new TableColumn({
        name: 'user_name_update',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'user_id_update',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'user_name_create',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'user_id_create',
        type: 'varchar',
      }),
      new TableColumn({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: 'now()',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('links', 'active');

    await queryRunner.dropColumn('links', 'created_at');

    await queryRunner.dropColumn('links', 'updated_at');

    await queryRunner.dropColumn('links', 'user_name_create');

    await queryRunner.dropColumn('links', 'user_id_create');

    await queryRunner.dropColumn('links', 'user_name_update');

    await queryRunner.dropColumn('links', 'user_id_update');
  }
}
