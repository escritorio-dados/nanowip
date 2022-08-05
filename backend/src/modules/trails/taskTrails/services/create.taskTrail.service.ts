import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { AppError } from '@shared/errors/AppError';

import { CreateTagsGroupService } from '@modules/tags/tagsGroups/services/create.tagsGroup.service';
import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';
import { FindOneTrailService } from '@modules/trails/trails/services/findOne.trail.service';

import { CreateTaskTrailDto } from '../dtos/create.taskTrail.dto';
import { taskTrailErrors } from '../errors/taskTrail.errors';
import { TaskTrailsRepository } from '../repositories/taskTrails.repository';
import { ICreateTaskTrailRepository } from '../repositories/types';
import { CommonTaskTrailService } from './common.taskTrail.service';

type ICreateTaskTrailService = CreateTaskTrailDto & { organization_id: string };

@Injectable()
export class CreateTaskTrailService {
  constructor(
    @InjectConnection() private connection: Connection,

    private taskTrailsRepository: TaskTrailsRepository,
    private commonTaskTrailService: CommonTaskTrailService,

    private findOneTrailService: FindOneTrailService,
    private findOneTaskTypeService: FindOneTaskTypeService,
    private createTagsGroupService: CreateTagsGroupService,
  ) {}

  async execute({
    name,
    trail_id,
    task_type_id,
    next_tasks_ids,
    previous_tasks_ids,
    organization_id,
    tags,
  }: ICreateTaskTrailService) {
    const newTask = {
      organization_id,
    } as ICreateTaskTrailRepository;

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

    return this.connection.transaction(async manager => {
      if (tags) {
        const tagsGroup = await this.createTagsGroupService.createTags(
          { organization_id, tags },
          manager,
        );

        newTask.tagsGroup = tagsGroup;
      }

      return this.taskTrailsRepository.create(newTask, manager);
    });
  }
}
