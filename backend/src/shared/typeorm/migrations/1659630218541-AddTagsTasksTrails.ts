import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTagsTasksTrails1659630218541 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'task_trails',
      new TableColumn({
        name: 'tags_group_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: `task_trails_to_tags_groups`,
        columnNames: ['tags_group_id'],
        referencedTableName: 'tags_groups',
        referencedColumnNames: ['id'],
        deferrable: 'DEFERRABLE',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('task_trails', 'tags_group_id');
  }
}
