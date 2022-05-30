import { Injectable } from '@nestjs/common';

import { recalculateEndDate } from '@shared/utils/changeDatesAux';
import { isDifferentDate } from '@shared/utils/isDifferentDate';
import { sliceList } from '@shared/utils/sliceList';

import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';

import { Task } from '../entities/Task';
import { FixDatesTaskService } from './fixDates.task.service';

@Injectable()
export class RecalculateDatesTaskService {
  constructor(
    private tasksRepository: TasksRepository,
    private fixDatesTaskService: FixDatesTaskService,
  ) {}

  async recalculateDates(organization_id: string) {
    // Pegar todos os tasks junto com os seus assignments
    const tasks = await this.tasksRepository.findAll({
      relations: ['assignments', 'nextTasks'],
      organization_id,
    });

    const tasksWithAssignments = tasks.filter(task => task.assignments.length > 0);

    // Separando as tarefas em pacotes menores (Para conseguir salvar) (2000 Registros por pacote)
    const splicedTasks = sliceList({ array: tasksWithAssignments, maxLenght: 2000 });

    const checkNextTasks: string[] = [];

    for await (const sliceTasks of splicedTasks) {
      const saveTasks: Task[] = [];

      sliceTasks.forEach(task => {
        const newStart = this.fixDatesTaskService.recalculateStartDate(task.assignments);

        const newEnd = this.fixDatesTaskService.recalculateEndDate(task.assignments);

        if (
          isDifferentDate(newStart, task.startDate, true) ||
          isDifferentDate(newEnd, task.endDate, true)
        ) {
          saveTasks.push({
            ...task,
            startDate: newStart || task.startDate,
            endDate: newEnd || task.endDate,
          });
        }

        if (isDifferentDate(newEnd, task.endDate, true) && task.nextTasks.length > 0) {
          checkNextTasks.push(task.id);
        }
      });

      await this.tasksRepository.saveAll(saveTasks);
    }

    if (checkNextTasks.length > 0) {
      const nextTasks = await this.tasksRepository.findManyNextTasks(checkNextTasks);

      const splicedNextTasks = sliceList({ array: nextTasks, maxLenght: 2000 });

      for await (const sliceTasks of splicedNextTasks) {
        const saveTasks: Task[] = [];

        sliceTasks.forEach(nextTask => {
          const newDate = recalculateEndDate(nextTask.previousTasks);

          if (isDifferentDate(newDate, nextTask.availableDate, true)) {
            saveTasks.push({
              ...nextTask,
              availableDate: newDate,
            });
          }
        });

        await this.tasksRepository.saveAll(saveTasks);
      }
    }
  }
}
