import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class ChangeTaskTrailDependencies1651688564057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into task_trails_dependencies (task_id, previous_task_id)
      select 
        t.id as task_id,
        t.task_before_id as previous_task_id
      from 
        task_trails t
      where
        t.task_before_id is not null
    `);

    await queryRunner.dropColumn('task_trails', 'task_before_id');
    await queryRunner.dropColumn('task_trails', 'position');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'position',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'task_before_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_task_before',
        columnNames: ['task_before_id'],
        referencedTableName: 'task_trails',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
