/* eslint-disable max-classes-per-file */
import { isAfter, isBefore } from 'date-fns';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { OldProject } from '../oldClasses/ProjecUniqueDate';

export class UniqueDateProject1648492280291 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const projects = await queryRunner.manager.getRepository(OldProject).find();

    const newProjects = projects.map(project => {
      const {
        availableDateCalc,
        availableDateFixed,
        startDateCalc,
        endDateCalc,
        startDateFixed,
        endDateFixed,
      } = project;

      if (!availableDateFixed) {
        project.availableDateFixed = availableDateCalc;
      } else if (
        availableDateFixed &&
        availableDateCalc &&
        isBefore(availableDateCalc, availableDateFixed)
      ) {
        project.availableDateFixed = availableDateCalc;
      }

      if (!startDateFixed) {
        project.startDateFixed = startDateCalc;
      } else if (startDateFixed && startDateCalc && isBefore(startDateCalc, startDateFixed)) {
        project.startDateFixed = startDateCalc;
      }

      if (!endDateFixed) {
        project.endDateFixed = endDateCalc;
      } else if (endDateFixed && endDateCalc && isAfter(endDateCalc, endDateFixed)) {
        project.endDateFixed = endDateCalc;
      }

      return project;
    });

    await queryRunner.manager.getRepository(OldProject).save(newProjects);

    await queryRunner.renameColumn('projects', 'start_date_fixed', 'start_date');
    await queryRunner.renameColumn('projects', 'end_date_fixed', 'end_date');
    await queryRunner.renameColumn('projects', 'available_date_fixed', 'available_date');

    await queryRunner.dropColumn('projects', 'start_date_calc');
    await queryRunner.dropColumn('projects', 'end_date_calc');
    await queryRunner.dropColumn('projects', 'available_date_calc');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('projects', 'start_date', 'start_date_fixed');
    await queryRunner.renameColumn('projects', 'end_date', 'end_date_fixed');
    await queryRunner.renameColumn('projects', 'available_date', 'available_date_fixed');

    await queryRunner.addColumn(
      'projects',
      new TableColumn({
        name: 'start_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'projects',
      new TableColumn({
        name: 'end_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'projects',
      new TableColumn({
        name: 'available_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );
  }
}
