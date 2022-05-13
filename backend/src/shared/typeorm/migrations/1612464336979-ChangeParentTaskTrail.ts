import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

// Só executa se a tabela estiver limpa
export default class ChangeParentTaskTrail1612464336979 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('task_trails', 'product_trail_id');

    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'value_chain_trail_id',
        type: 'uuid',
      }),
    );

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_value_chain_trails',
        columnNames: ['value_chain_trail_id'],
        referencedTableName: 'value_chain_trails',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'task_trails',
      new TableIndex({
        name: 'unique_task_trail_value_chain_trails',
        columnNames: ['name', 'value_chain_trail_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('task_trails', 'value_chain_trail_id');

    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'product_trail_id',
        type: 'uuid',
      }),
    );

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_product_trails',
        columnNames: ['product_trail_id'],
        referencedTableName: 'product_trails',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'task_trails',
      new TableIndex({
        name: 'unique_task_trail_product_trail',
        columnNames: ['name', 'product_trail_id'],
        isUnique: true,
      }),
    );
  }
}
