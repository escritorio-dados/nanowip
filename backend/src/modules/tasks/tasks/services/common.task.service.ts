import { Injectable } from '@nestjs/common';
import { isAfter, isBefore } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Task } from '@modules/tasks/tasks/entities/Task';
import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';

import { taskErrors } from '../errors/task.errors';

type IResolvePreviousTasks = {
  previous_tasks_ids: string[];
  availableDate: Date;
  organization_id: string;
};

type IResolveNextTasks = {
  next_tasks_ids: string[];
  endDate: Date;
  organization_id: string;
};

type IGetTask = { id: string; organization_id: string; relations?: string[] };
type IValidateTask = { task: Task; organization_id: string };

@Injectable()
export class CommonTaskService {
  constructor(private tasksRepository: TasksRepository) {}

  async validadeName(name: string, value_chain_id: string): Promise<void> {
    const task = await this.tasksRepository.findByName(name.trim(), value_chain_id);

    if (task) {
      throw new AppError(taskErrors.duplicateName);
    }
  }

  validateTask({ task, organization_id }: IValidateTask) {
    if (!task) {
      throw new AppError(taskErrors.notFound);
    }

    validateOrganization({ entity: task, organization_id });
  }

  async getTask({ id, organization_id, relations }: IGetTask): Promise<Task> {
    const task = await this.tasksRepository.findById(id, relations);

    this.validateTask({ task, organization_id });

    return task;
  }

  async resolvePreviousTasks({
    availableDate,
    organization_id,
    previous_tasks_ids,
  }: IResolvePreviousTasks) {
    if (!previous_tasks_ids || previous_tasks_ids.length === 0) {
      return [];
    }

    // Pegado as tarefas anteriores
    const previousTasks = await this.tasksRepository.findAllByKeys({
      ids: previous_tasks_ids,
      key: 'id',
      organization_id,
    });

    const previousTaskNotCompleted = previousTasks.some(previousTask => {
      const availableWithoutEnd = !previousTask.endDate && !!availableDate;

      const availableBeforeEnd =
        !!previousTask.endDate && !!availableDate && isBefore(availableDate, previousTask.endDate);

      return availableWithoutEnd || availableBeforeEnd;
    });

    if (previousTaskNotCompleted) {
      throw new AppError(taskErrors.previousTasksNotCompleted);
    }

    return previousTasks;
  }

  async resolveNextTasks({ endDate, organization_id, next_tasks_ids }: IResolveNextTasks) {
    if (!next_tasks_ids || next_tasks_ids.length === 0) {
      return [];
    }

    // Pegado as tarefas anteriores
    const nextTasks = await this.tasksRepository.findAllByKeys({
      ids: next_tasks_ids,
      key: 'id',
      organization_id,
    });

    const nextTaskAlreadyStarted = nextTasks.some(nextTask => {
      const availableWithoutEnd = !endDate && !!nextTask.startDate;

      const availableBeforeEnd =
        !!endDate && !!nextTask.startDate && isAfter(endDate, nextTask.startDate);

      return availableWithoutEnd || availableBeforeEnd;
    });

    if (nextTaskAlreadyStarted) {
      throw new AppError(taskErrors.nextTasksAlreadyStarted);
    }

    return nextTasks;
  }
}
