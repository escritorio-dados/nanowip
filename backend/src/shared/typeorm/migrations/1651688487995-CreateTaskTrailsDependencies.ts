import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTaskTrailsDependencies1651688487995 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'task_trails_dependencies',
        columns: [
          {
            name: 'task_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'previous_task_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'task_trails_dependencies_to_tasks',
            columnNames: ['task_id'],
            referencedTableName: 'task_trails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: 'task_trails_dependencies_to_previous_tasks',
            columnNames: ['previous_task_id'],
            referencedTableName: 'task_trails',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('task_trails_dependencies');
  }
}
