import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';
import { FindOneTrailService } from '@modules/trails/services/findOne.trail.service';

import { CreateTaskTrailDto } from '../dtos/create.taskTrail.dto';
import { ICreateTaskTrailRepositoryDto } from '../dtos/create.taskTrail.repository.dto';
import { taskTrailErrors } from '../errors/taskTrail.errors';
import { TaskTrailsRepository } from '../repositories/taskTrails.repository';
import { CommonTaskTrailService } from './common.taskTrail.service';

type ICreateTaskTrailService = CreateTaskTrailDto & { organization_id: string };

@Injectable()
export class CreateTaskTrailService {
  constructor(
    private taskTrailsRepository: TaskTrailsRepository,
    private commonTaskTrailService: CommonTaskTrailService,

    private findOneTrailService: FindOneTrailService,
    private findOneTaskTypeService: FindOneTaskTypeService,
  ) {}

  async execute({
    name,
    trail_id,
    task_type_id,
    next_tasks_ids,
    previous_tasks_ids,
    organization_id,
  }: ICreateTaskTrailService) {
    const newTask: ICreateTaskTrailRepositoryDto = {
      organization_id,
    } as ICreateTaskTrailRepositoryDto;

    newTask.trail = await this.findOneTrailService.execute({ id: trail_id, organization_id });

    await this.commonTaskTrailService.validadeName(name, trail_id);

    newTask.name = name.trim();

    newTask.taskType = await this.findOneTaskTypeService.execute({
      id: task_type_id,
      organization_id,
    });

    const circularDependency = previous_tasks_ids.some(prev_id => next_tasks_ids.includes(prev_id));

    if (circularDependency) {
      throw new AppError(taskTrailErrors.circularDependency);
    }

    newTask.previousTasks = await this.commonTaskTrailService.resolvePreviousTasks({
      previous_tasks_ids,
      organization_id,
    });

    newTask.nextTasks = await this.commonTaskTrailService.resolveNextTasks({
      next_tasks_ids,
      organization_id,
    });

    const task = await this.taskTrailsRepository.create(newTask);

    return task;
  }
}
