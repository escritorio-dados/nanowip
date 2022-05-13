import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMoreInfoCosts1652274483014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('costs', [
      new TableColumn({
        name: 'document_link',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'percent_distributed',
        type: 'float',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('costs', ['document_link', 'percent_distributed']);
  }
}
