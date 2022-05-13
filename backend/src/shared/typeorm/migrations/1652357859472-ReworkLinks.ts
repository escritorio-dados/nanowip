import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ReworkLinks1652357859472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('links', 'user_name_update', 'owner');

    await queryRunner.query('ALTER TABLE links ALTER COLUMN owner DROP NOT NULL');

    await queryRunner.addColumns('links', [
      new TableColumn({
        name: 'description',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'category',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.dropColumns('links', [
      'user_id_update',
      'user_name_create',
      'user_id_create',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('links', 'owner', 'user_name_update');

    await queryRunner.dropColumns('links', ['description', 'category']);

    await queryRunner.addColumns('links', [
      new TableColumn({
        name: 'user_name_create',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'user_id_update',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'user_id_create',
        type: 'uuid',
        isNullable: true,
      }),
    ]);
  }
}
