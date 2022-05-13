import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDescriptionTask1651513065967 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('tasks', [
      new TableColumn({
        name: 'description',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'link',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('tasks', ['description', 'link']);
  }
}
