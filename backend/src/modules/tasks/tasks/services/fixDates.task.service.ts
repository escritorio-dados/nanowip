import { Injectable } from '@nestjs/common';
import { max, min } from 'date-fns';

import { recalculateEndDate } from '@shared/utils/changeDatesAux';
import { DatesController } from '@shared/utils/ServiceDatesController';

import { Assignment } from '@modules/assignments/entities/Assignment';
import { StatusAssignment } from '@modules/assignments/enums/status.assignment.enum';
import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';
import { FixDatesValueChainService } from '@modules/valueChains/services/fixDates.valueChain.service';

import { Task } from '../entities/Task';

@Injectable()
export class FixDatesTaskService {
  constructor(
    private tasksRepository: TasksRepository,

    private fixDatesValueChainService: FixDatesValueChainService,
  ) {}

  async ajustNextDates(task_id: string) {
    const { nextTasks, value_chain_id } = await this.tasksRepository.findNextTasks(task_id);

    if (nextTasks.length === 0) {
      return;
    }

    const tasksFromAnotherValueChain: Task[] = [];

    const fixedTasks = nextTasks.map(nextTask => {
      // Vai buscar a maior date de termino ou null se não finalizaram todos
      const newDate = recalculateEndDate(nextTask.previousTasks);

      if (nextTask.value_chain_id !== value_chain_id) {
        tasksFromAnotherValueChain.push(nextTask);
      }

      return {
        ...nextTask,
        availableDate: newDate,
      };
    });

    await this.tasksRepository.saveAll(fixedTasks);

    for await (const task of tasksFromAnotherValueChain) {
      await this.fixDatesValueChainService.recalculateDates(task.value_chain_id, 'available');
    }
  }

  recalculateStartDate(assignments: Assignment[]) {
    // Pegando somente as datas de inicio, e removendo da lista as datas vazias
    const dates = assignments.map(({ startDate }) => startDate).filter(date => !!date);

    // Se alguma iniciou vai renornar a menor data entre eles
    if (dates.length >= 1) {
      return min(dates);
    }

    // Se nenhuma inicou retorna null
    return null;
  }

  recalculateEndDate(assignments: Assignment[]) {
    // Pegando as datas de fim e removendo as vazias
    const dates = assignments
      .filter(assignment => assignment.endDate && assignment.status === StatusAssignment.close)
      .map(({ endDate }) => endDate);

    // Se todas finalizaram pega a maior
    if (dates.length > 0 && dates.length === assignments.length) {
      return max(dates);
    }

    // Se tem alguma que não finalizou retorna null
    return null;
  }

  async recalculateDates(task_id: string, mode: 'full' | 'start' | 'end' | 'available') {
    const task = await this.tasksRepository.findById(task_id, [
      'assignments',
      'nextTasks',
      'previousTasks',
    ]);

    const datesController = new DatesController({
      start: task.startDate,
      end: task.endDate,
    });

    // Data de inicio
    if (mode === 'start' || mode === 'full') {
      task.startDate = this.recalculateStartDate(task.assignments);
    }

    // Data de término
    if (mode === 'end' || mode === 'full') {
      task.endDate = this.recalculateEndDate(task.assignments);
    }

    datesController.updateDates({ start: task.startDate, end: task.endDate });

    if (datesController.needChangeDates()) {
      await this.tasksRepository.save(task);

      // Atualizando dependentes
      if (datesController.changed('end')) {
        await this.ajustNextDates(task_id);
      }

      await this.fixDatesValueChainService.recalculateDates(
        task.value_chain_id,
        datesController.getMode(),
      );
    }
  }
}
