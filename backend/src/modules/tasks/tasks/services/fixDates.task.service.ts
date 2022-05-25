import { Injectable } from '@nestjs/common';

import {
  INeedRecalculate,
  recalculateEndDate,
  verifyChangesEndDates,
  verifyChangesInitDates,
  verifyNeedRecalculate,
} from '@shared/utils/changeDatesAux';
import { DatesChangesController, IOldNewDatesFormat } from '@shared/utils/DatesChangeController';

import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';
import { FixDatesValueChainService } from '@modules/valueChains/services/fixDates.valueChain.service';

import { Task } from '../entities/Task';

type IVerifyDatesChanges = IOldNewDatesFormat & {
  task_id: string;
  deleted?: boolean;
};

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

    const tasksFromAnotherValueChain: [Task, Date | null, Date | null][] = [];

    const FixedTasks = nextTasks.map(nextTask => {
      // Vai buscar a maior date de termino ou null se não finalizaram todos
      const newDate = recalculateEndDate(nextTask.previousTasks);

      if (nextTask.value_chain_id !== value_chain_id) {
        tasksFromAnotherValueChain.push([nextTask, nextTask.availableDate, newDate]);
      }

      return {
        ...nextTask,
        availableDate: newDate,
      };
    });

    await this.tasksRepository.saveAll(FixedTasks);

    for await (const [task, oldAvailable, newAvailable] of tasksFromAnotherValueChain) {
      await this.fixDatesValueChainService.verifyDatesChanges({
        value_chain_id: task.value_chain_id,
        available: { old: oldAvailable, new: newAvailable },
      });
    }
  }

  async validadeSubEntities(data: INeedRecalculate) {
    const needRecalculate = verifyNeedRecalculate(data);

    if (needRecalculate) {
      const { assignments } = await this.tasksRepository.findById(data.currentObject.id, [
        'assignments',
      ]);

      return assignments;
    }

    return undefined;
  }

  async verifyDatesChanges({ task_id, deleted, end, start }: IVerifyDatesChanges) {
    if (!end && !start && !deleted) {
      return;
    }

    const task = await this.tasksRepository.findById(task_id);

    const datesController = new DatesChangesController(task);

    const subEntities = await this.validadeSubEntities({
      currentObject: task,
      deleted,
      end,
      start,
    });

    if (start) {
      task.startDate = await verifyChangesInitDates({
        datesController,
        currentDate: task.startDate,
        newDate: start.new,
        oldDate: start.old,
        subEntities,
        type: 'changeStart',
      });
    }

    if (end || deleted) {
      task.endDate = await verifyChangesEndDates({
        datesController,
        currentDate: task.endDate,
        newDate: end?.new,
        subEntities,
        deleted,
      });
    }

    if (datesController.needSave()) {
      await this.tasksRepository.save(task);

      // Só vai mexer com os dependentes
      if (datesController.changeEnd) {
        await this.ajustNextDates(task_id);
      }

      await this.fixDatesValueChainService.verifyDatesChanges({
        value_chain_id: task.value_chain_id,
        ...datesController.getUpdateDatesParams({
          newStartDate: task.startDate,
          newEndDate: task.endDate,
        }),
      });
    }
  }
}
