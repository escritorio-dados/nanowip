import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';

import { UpdateTaskTrailDto } from '../dtos/update.taskTrail.dto';
import { taskTrailErrors } from '../errors/taskTrail.errors';
import { TaskTrailsRepository } from '../repositories/taskTrails.repository';
import { CommonTaskTrailService } from './common.taskTrail.service';

type IUpdateTaskTrailService = UpdateTaskTrailDto & { id: string; organization_id: string };

@Injectable()
export class UpdateTaskTrailService {
  constructor(
    private taskTrailsRepository: TaskTrailsRepository,
    private commonTaskTrailService: CommonTaskTrailService,
    private findOneTaskTypeService: FindOneTaskTypeService,
  ) {}

  async execute({
    id,
    name,
    task_type_id,
    next_tasks_ids,
    previous_tasks_ids,
    organization_id,
  }: IUpdateTaskTrailService) {
    const task = await this.commonTaskTrailService.getTaskTrail({ id, organization_id });

    if (task.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonTaskTrailService.validadeName(name, task.trail_id);
    }

    task.name = name.trim();

    const circularDependency =
      previous_tasks_ids.some(prev_id => next_tasks_ids.includes(prev_id) || prev_id === task.id) ||
      next_tasks_ids.includes(task.id);

    if (circularDependency) {
      throw new AppError(taskTrailErrors.circularDependency);
    }

    task.previousTasks = await this.commonTaskTrailService.resolvePreviousTasks({
      previous_tasks_ids,
      organization_id,
    });

    task.nextTasks = await this.commonTaskTrailService.resolveNextTasks({
      next_tasks_ids,
      organization_id,
    });

    if (task.task_type_id !== task_type_id) {
      task.taskType = await this.findOneTaskTypeService.execute({
        id: task_type_id,
        organization_id,
      });
    }

    await this.taskTrailsRepository.save(task);

    return task;
  }
}
