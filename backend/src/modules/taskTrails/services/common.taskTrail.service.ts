import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { TaskTrail } from '../entities/TaskTrail';
import { taskTrailErrors } from '../errors/taskTrail.errors';
import { TaskTrailsRepository } from '../repositories/taskTrails.repository';

type IGetTaskTrail = { id: string; organization_id: string; relations?: string[] };
type IValidateTask = { task: TaskTrail; organization_id: string };

type IResolvePreviousTasks = {
  previous_tasks_ids: string[];
  organization_id: string;
};

type IResolveNextTasks = {
  next_tasks_ids: string[];
  organization_id: string;
};

@Injectable()
export class CommonTaskTrailService {
  constructor(private taskTrailsRepository: TaskTrailsRepository) {}

  async validadeName(name: string, trail_id: string) {
    const taskTrailWithSameName = await this.taskTrailsRepository.findByName(name.trim(), trail_id);

    if (taskTrailWithSameName) {
      throw new AppError(taskTrailErrors.duplicateName);
    }
  }

  validateTask({ task, organization_id }: IValidateTask) {
    if (!task) {
      throw new AppError(taskTrailErrors.notFound);
    }

    validateOrganization({ entity: task, organization_id });
  }

  async getTaskTrail({ id, organization_id, relations }: IGetTaskTrail) {
    const taskTrail = await this.taskTrailsRepository.findById(id, relations);

    this.validateTask({ task: taskTrail, organization_id });

    return taskTrail;
  }

  async resolvePreviousTasks({ organization_id, previous_tasks_ids }: IResolvePreviousTasks) {
    if (!previous_tasks_ids || previous_tasks_ids.length === 0) {
      return [];
    }

    // Pegado as tarefas anteriores
    const previousTasks = await this.taskTrailsRepository.findAllByKeys({
      ids: previous_tasks_ids,
      key: 'id',
      organization_id,
    });

    return previousTasks;
  }

  async resolveNextTasks({ organization_id, next_tasks_ids }: IResolveNextTasks) {
    if (!next_tasks_ids || next_tasks_ids.length === 0) {
      return [];
    }

    // Pegado as tarefas anteriores
    const nextTasks = await this.taskTrailsRepository.findAllByKeys({
      ids: next_tasks_ids,
      key: 'id',
      organization_id,
    });

    return nextTasks;
  }
}
