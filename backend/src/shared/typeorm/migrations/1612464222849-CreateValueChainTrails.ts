import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateValueChainTrails1612464222849 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            onDelete: 'RESTRICT',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('value_chain_trails');
  }
}
