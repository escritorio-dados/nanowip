import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTagsTrailSections1660132949858 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trail_sections',
      new TableColumn({
        name: 'tags_group_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'trail_sections',
      new TableForeignKey({
        name: `trail_sections_to_tags_groups`,
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
    await queryRunner.dropColumn('trail_sections', 'tags_group_id');
  }
}
