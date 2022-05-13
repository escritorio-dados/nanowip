import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { taskTypeErrors } from '../errors/taskType.errors';
import { TaskTypesRepository } from '../repositories/taskTypes.repository';
import { CommonTaskTypeService } from './common.taskType.service';

type IDeleteTaskTypeService = { id: string; organization_id: string };

@Injectable()
export class DeleteTaskTypeService {
  constructor(
    private taskTypesRepository: TaskTypesRepository,
    private commonTaskTypeService: CommonTaskTypeService,
  ) {}

  async execute({ id, organization_id }: IDeleteTaskTypeService) {
    const taskType = await this.commonTaskTypeService.getTaskType({
      id,
      relations: ['tasks', 'taskTrails'],
      organization_id,
    });

    if (taskType.tasks.length > 0) {
      throw new AppError(taskTypeErrors.deleteWithTasks);
    }

    if (taskType.taskTrails.length > 0) {
      throw new AppError(taskTypeErrors.deleteWithTasksTrail);
    }

    await this.taskTypesRepository.delete(taskType);
  }
}
