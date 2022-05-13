import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

// Está mutation só funciona por que foi excluido previamente os dados
// não foi feito uma mutation mais elaborado por que causaria muito trabalho para fazer, sendo quando foi criada
// ainda estava em ambiente de desenvolvimento
export default class ChangeParentTask1612375484703 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tasks', 'product_id');

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'value_chain_id',
        type: 'uuid',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        name: 'tasks_to_value_chains',
        columnNames: ['value_chain_id'],
        referencedTableName: 'value_chains',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'unique_task_value_chains',
        columnNames: ['name', 'value_chain_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tasks', 'value_chain_id');

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'product_id',
        type: 'uuid',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        name: 'tasks_to_products',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'unique_task_product',
        columnNames: ['name', 'product_id'],
        isUnique: true,
      }),
    );
  }
}
