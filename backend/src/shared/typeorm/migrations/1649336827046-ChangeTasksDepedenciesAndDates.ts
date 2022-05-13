import { isAfter, isBefore } from 'date-fns';
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

import { sliceList } from '@shared/utils/sliceList';

import { TaskChangeDependency } from '../oldClasses/TaskChangeDependecy';

export class ChangeTasksDepedenciesAndDates1649336827046 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tasks = await queryRunner.manager.getRepository(TaskChangeDependency).find();

    const newTasks = tasks.map(task => {
      const { startDateCalc, endDateCalc, startDateFixed, endDateFixed } = task;

      if (!startDateFixed) {
        task.startDateFixed = startDateCalc;
      } else if (startDateFixed && startDateCalc && isBefore(startDateCalc, startDateFixed)) {
        task.startDateFixed = startDateCalc;
      }

      if (!endDateFixed) {
        task.endDateFixed = endDateCalc;
      } else if (endDateFixed && endDateCalc && isAfter(endDateCalc, endDateFixed)) {
        task.endDateFixed = endDateCalc;
      }

      return task;
    });

    // Dividir as tarefas em grupos de 2000 e salvar
    const slicedTasks = sliceList({ array: newTasks, maxLenght: 2000 });

    for await (const sliceTasks of slicedTasks) {
      await queryRunner.manager.getRepository(TaskChangeDependency).save(sliceTasks);
    }

    await queryRunner.query(`
      insert into task_dependencies (task_id, previous_task_id)
      select 
        t.id as task_id,
        t.task_before_id as previous_task_id
      from 
        tasks t
      where
        t.task_before_id is not null
    `);

    await queryRunner.renameColumn('tasks', 'start_date_fixed', 'start_date');
    await queryRunner.renameColumn('tasks', 'end_date_fixed', 'end_date');

    await queryRunner.dropColumn('tasks', 'start_date_calc');
    await queryRunner.dropColumn('tasks', 'end_date_calc');
    await queryRunner.dropColumn('tasks', 'task_before_id');
    await queryRunner.dropColumn('tasks', 'position');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('tasks', 'start_date', 'start_date_fixed');
    await queryRunner.renameColumn('tasks', 'end_date', 'end_date_fixed');

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'start_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'end_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'position',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'task_before_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        name: 'tasks_to_task_before',
        columnNames: ['task_before_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
