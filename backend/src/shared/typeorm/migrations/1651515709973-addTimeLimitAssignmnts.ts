import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addTimeLimitAssignmnts1651515709973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'time_limit',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assignments', 'time_limit');
  }
}
