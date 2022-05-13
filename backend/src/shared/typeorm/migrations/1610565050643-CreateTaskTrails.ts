import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTaskTrails1610565050643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'task_trails',
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
            name: 'task_type_id',
            type: 'uuid',
          },
          {
            name: 'task_before_id',
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
            name: 'task_trails_to_task_types',
            columnNames: ['task_type_id'],
            referencedTableName: 'task_types',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            name: 'task_trails_to_task_before',
            columnNames: ['task_before_id'],
            referencedTableName: 'task_trails',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          {
            name: 'task_trails_to_product_trails',
            columnNames: ['product_trail_id'],
            referencedTableName: 'product_trails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'unique_task_product_trails',
            columnNames: ['name', 'product_trail_id'],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('task_trails');
  }
}
