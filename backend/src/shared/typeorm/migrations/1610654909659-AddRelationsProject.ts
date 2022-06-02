import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

import { DEFAULT_PROJECT_TYPE_ID } from '@modules/projects/projectTypes/seeds/projectType.seeds';

export default class AddRelationsProject1610654909659 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('projects', [
      new TableColumn({
        name: 'project_parent_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'project_type_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);

    await await queryRunner.query(
      `UPDATE projects SET project_type_id = '${DEFAULT_PROJECT_TYPE_ID}'`,
    );

    await queryRunner.changeColumn(
      'projects',
      'project_type_id',
      new TableColumn({ name: 'project_type_id', type: 'uuid', isNullable: false }),
    );

    await queryRunner.changeColumn(
      'projects',
      'customer_id',
      new TableColumn({ name: 'customer_id', type: 'uuid', isNullable: true }),
    );

    await queryRunner.createForeignKeys('projects', [
      new TableForeignKey({
        name: 'projects_to_projects',
        columnNames: ['project_parent_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'projects_to_project_types',
        columnNames: ['project_type_id'],
        referencedTableName: 'project_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'unique_project_parent',
        columnNames: ['name', 'project_parent_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('projects', 'unique_project_parent');

    await queryRunner.dropForeignKey('projects', 'projects_to_project_types');

    await queryRunner.dropForeignKey('projects', 'projects_to_projects');

    await queryRunner.changeColumn(
      'projects',
      'customer_id',
      new TableColumn({ name: 'customer_id', type: 'uuid', isNullable: false }),
    );

    await queryRunner.dropColumn('projects', 'project_type_id');

    await queryRunner.dropColumn('projects', 'project_parent_id');
  }
}
