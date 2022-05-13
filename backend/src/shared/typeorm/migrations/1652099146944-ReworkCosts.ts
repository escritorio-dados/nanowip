import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class ReworkCosts1652099146944 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criando as distribuições pertinentes
    await queryRunner.query(`
      insert into cost_distributions (product_id, cost_id, percent, organization_id)
      select 
        c.product_id,
        c.id as cost_id,
        1 as "percent",
        c.organization_id
      from 
        costs c
      where
        c.product_id is not null
    `);
    // Aplicando as alterações na colunas
    await queryRunner.renameColumn('costs', 'date', 'payment_date');

    await queryRunner.renameColumn('costs', 'nf', 'document_number');

    await queryRunner.query('ALTER TABLE costs ALTER COLUMN document_number TYPE varchar');

    await queryRunner.query('ALTER TABLE costs ALTER COLUMN payment_date DROP NOT NULL');

    // Criando as colunas novas
    await queryRunner.addColumns('costs', [
      new TableColumn({
        name: 'document_type_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'service_provider_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'due_date',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
      new TableColumn({
        name: 'issue_date',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    ]);

    // Criando as relações
    await queryRunner.createForeignKeys('costs', [
      new TableForeignKey({
        name: 'cost_to_document_types',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'cost_to_service_providers',
        columnNames: ['service_provider_id'],
        referencedTableName: 'service_providers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Excluindo as colunas desnecessarias
    await queryRunner.dropColumns('costs', ['product_id', 'project_id', 'task_id', 'os', 'status']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Essa migration não tem como ser desfeita de maneira direta pelo código

    await queryRunner.renameColumn('costs', 'payment_date', 'date');
  }
}
