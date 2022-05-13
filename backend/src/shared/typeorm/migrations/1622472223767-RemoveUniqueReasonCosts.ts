import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class RemoveUniqueReasonCosts1622472223767 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('costs', 'unique_cost_by_project');

    await queryRunner.dropIndex('costs', 'unique_cost_by_product');

    await queryRunner.dropIndex('costs', 'unique_cost_by_task');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndices('costs', [
      new TableIndex({
        name: 'unique_cost_by_project',
        columnNames: ['reason', 'project_id'],
        isUnique: true,
      }),
      new TableIndex({
        name: 'unique_cost_by_product',
        columnNames: ['reason', 'product_id'],
        isUnique: true,
      }),
      new TableIndex({
        name: 'unique_cost_by_task',
        columnNames: ['reason', 'task_id'],
        isUnique: true,
      }),
    ]);
  }
}
