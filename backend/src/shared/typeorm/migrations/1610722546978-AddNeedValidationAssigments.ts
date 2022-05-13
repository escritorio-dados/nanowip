import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddNeedValidationAssigments1610722546978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'need_validation',
        type: 'boolean',
        isNullable: true,
      }),
    );

    await queryRunner.query(`UPDATE assignments SET need_validation = false`);

    await queryRunner.changeColumn(
      'assignments',
      'need_validation',
      new TableColumn({ name: 'need_validation', type: 'boolean', isNullable: false }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assignments', 'need_validation');
  }
}
