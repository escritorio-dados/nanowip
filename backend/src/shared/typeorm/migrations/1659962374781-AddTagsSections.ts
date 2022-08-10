import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTagsSections1659962374781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'objective_sections',
      new TableColumn({
        name: 'tags_group_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'objective_sections',
      new TableForeignKey({
        name: `objective_sections_to_tags_groups`,
        columnNames: ['tags_group_id'],
        referencedTableName: 'tags_groups',
        referencedColumnNames: ['id'],
        deferrable: 'DEFERRABLE',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.addColumn(
      'objective_categories',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: true,
        default: "'manual'",
      }),
    );

    await queryRunner.query("UPDATE objective_categories SET type = 'manual'");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('objective_sections', 'tags_group_id');

    await queryRunner.dropColumn('objective_categories', 'type');
  }
}
