import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateProductTrails1610564675675 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_trails');
  }
}
