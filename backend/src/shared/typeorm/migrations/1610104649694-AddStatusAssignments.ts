import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { StatusAssignment } from '@modules/assignments/enums/status.assignment.enum';

export default class AddStatusAssignments1610104649694 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.query(`UPDATE assignments SET status = '${StatusAssignment.open}'`);

    await queryRunner.changeColumn(
      'assignments',
      'status',
      new TableColumn({ name: 'status', type: 'varchar', isNullable: false }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assignments', 'status');
  }
}
