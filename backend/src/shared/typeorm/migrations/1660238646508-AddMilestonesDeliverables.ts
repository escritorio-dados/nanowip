import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddMilestonesDeliverables1660238646508 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'deliverable_tags',
      new TableColumn({
        name: 'milestones_group_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'deliverable_tags',
      new TableForeignKey({
        name: `deliverable_tags_to_milestones_groups`,
        columnNames: ['milestones_group_id'],
        referencedTableName: 'milestones_groups',
        referencedColumnNames: ['id'],
        deferrable: 'DEFERRABLE',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.addColumn(
      'deliverables',
      new TableColumn({
        name: 'milestones_group_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'deliverables',
      new TableForeignKey({
        name: `deliverables_to_milestones_groups`,
        columnNames: ['milestones_group_id'],
        referencedTableName: 'milestones_groups',
        referencedColumnNames: ['id'],
        deferrable: 'DEFERRABLE',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('deliverable_tags', 'milestones_group_id');

    await queryRunner.dropColumn('deliverables', 'milestones_group_id');
  }
}
