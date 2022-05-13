import { Injectable } from '@nestjs/common';

import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';

import { TasksRepository } from '../repositories/tasks.repository';
import { CommonTaskService } from './common.task.service';

type IFindOneTaskService = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class FindOneTaskService {
  constructor(
    private commonTaskService: CommonTaskService,
    private tasksRepository: TasksRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneTaskService) {
    const task = await this.tasksRepository.findByIdInfo(id);

    this.commonTaskService.validateTask({ organization_id, task });

    const taskFormatted = {
      ...task,
      statusDate: getStatusDate(task),
      path: getParentPath({
        entity: task,
        getCustomer: true,
        entityType: 'task',
      }),
      nextTasks: task.nextTasks.map(nextTask => ({
        ...nextTask,
        pathString: getParentPathString({
          entity: nextTask,
          getProduct: true,
          entityType: 'task',
        }),
        valueChain: undefined,
      })),
      previousTasks: task.previousTasks.map(previousTask => ({
        ...previousTask,
        pathString: getParentPathString({
          entity: previousTask,
          getProduct: true,
          entityType: 'task',
        }),
        valueChain: undefined,
      })),
      valueChain: undefined,
    };

    return taskFormatted;
  }

  async execute({ id, organization_id, relations }: IFindOneTaskService) {
    const task = await this.commonTaskService.getTask({ id, relations, organization_id });

    return task;
  }
}
