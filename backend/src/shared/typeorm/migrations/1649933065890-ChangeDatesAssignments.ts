import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDatesAssignments1649933065890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('assignments', 'start_date_calc', 'start_date');
    await queryRunner.renameColumn('assignments', 'end_date_calc', 'end_date');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('assignments', 'start_date', 'start_date_calc');
    await queryRunner.renameColumn('assignments', 'end_date', 'end_date_calc');
  }
}
