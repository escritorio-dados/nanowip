import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export default class FixTrailStructure1617814256607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Mudando a estrutura das tarefas (trilha)

    // Limpando a tabela de trilhas para não ter nenhum dado incorreto (não dá para reaproveitar)
    await queryRunner.manager.query('TRUNCATE TABLE trails CASCADE');

    // Excluir a coluna value_chain_trail_id
    await queryRunner.dropColumn('task_trails', 'value_chain_trail_id');

    // Criar Coluna e Fk com trilhas diretamente
    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'trail_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_trails',
        columnNames: ['trail_id'],
        referencedTableName: 'trails',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Removendo as tabelas de de value chain trails e product trails
    await queryRunner.dropTable('value_chain_trails');

    await queryRunner.dropTable('product_trails');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recriar tabelas value_chain_trails e product_trails
    await queryRunner.createTable(
      new Table({
        name: 'product_trails',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'quantity',
            type: 'float',
          },
          {
            name: 'trail_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'product_type_id',
            type: 'uuid',
          },
          {
            name: 'measure_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'product_trails_to_trails',
            columnNames: ['trail_id'],
            referencedTableName: 'trails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: 'product_trails_to_product_trails',
            columnNames: ['parent_id'],
            referencedTableName: 'product_trails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: 'product_trails_to_product_types',
            columnNames: ['product_type_id'],
            referencedTableName: 'product_types',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            name: 'product_trails_to_measures',
            columnNames: ['measure_id'],
            referencedTableName: 'measures',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'unique_product_trail_by_product_trail',
            columnNames: ['name', 'parent_id'],
            isUnique: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'value_chain_trails',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'position',
            type: 'int',
          },
          {
            name: 'value_chain_trail_before_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'product_trail_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'value_chain_trails_to_value_chain_trails_before',
            columnNames: ['value_chain_trail_before_id'],
            referencedTableName: 'value_chain_trails',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          {
            name: 'value_chain_trails_to_product_trails',
            columnNames: ['product_trail_id'],
            referencedTableName: 'product_trails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'unique_value_chain_trail_product_trails',
            columnNames: ['name', 'product_trail_id'],
            isUnique: true,
          },
        ],
      }),
    );

    // Removendo a coluna trail_id
    await queryRunner.dropColumn('task_trails', 'trail_id');

    // Limpando as trilhas (pois não é possivel reaproveitar a estrutura (muito complexo))
    await queryRunner.manager.query('TRUNCATE TABLE trails CASCADE');

    // Recriando antiga relação com product_trails
    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'value_chain_trail_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_value_chain_trails',
        columnNames: ['value_chain_trail_id'],
        referencedTableName: 'value_chain_trails',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
