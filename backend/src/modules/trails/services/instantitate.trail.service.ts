import { Injectable } from '@nestjs/common';

import { CreateTaskService } from '@modules/tasks/services/create.task.service';
import { TaskTrail } from '@modules/taskTrails/entities/TaskTrail';
import { TaskTrailsRepository } from '@modules/taskTrails/repositories/taskTrails.repository';
import { CreateValueChainService } from '@modules/valueChains/services/create.valueChain.service';

import { InstantiateTrailDto } from '../dtos/instantiateTrail.dto';

type IMapIds = { [key: string]: string };
type ITaskToSort = { [key: string]: TaskTrail };

type IInstantitateTrailService = InstantiateTrailDto & { organization_id: string };

@Injectable()
export class InstantiateTrailService {
  constructor(
    private createValueChainService: CreateValueChainService,
    private createTaskService: CreateTaskService,
    private taskTrailsRepository: TaskTrailsRepository,
  ) {}

  async execute({ name, product_id, trail_id, organization_id }: IInstantitateTrailService) {
    const tasks = await this.taskTrailsRepository.findAllGraph({
      organization_id,
      trail_id,
    });

    const valueChainCreated = await this.createValueChainService.execute({
      name,
      product_id,
      organization_id,
    });

    // Ordenando as tarefas, para serem criadas na ordem correta
    const taskToSort = tasks.reduce((taskObject, task) => {
      taskObject[task.id] = task;

      return taskObject;
    }, {} as ITaskToSort);

    const sortedTasks: TaskTrail[] = [];

    while (Object.keys(taskToSort).length > 0) {
      Object.values(taskToSort).forEach(task => {
        if (task.previousTasks.length === 0) {
          sortedTasks.push(task);

          delete taskToSort[task.id];

          return;
        }

        const someTaskNotCreated = task.previousTasks.some(prev => !!taskToSort[prev.id]);

        if (!someTaskNotCreated) {
          sortedTasks.push(task);

          delete taskToSort[task.id];
        }
      });
    }

    const mapsTasksIds: IMapIds = {};

    for await (const task of sortedTasks) {
      const previous_tasks_ids = task.previousTasks.map(prev => mapsTasksIds[prev.id]);

      const taskCreated = await this.createTaskService.execute({
        name: task.name,
        task_type_id: task.task_type_id,
        value_chain_id: valueChainCreated.id,
        previous_tasks_ids,
        next_tasks_ids: [],
        organization_id,
      });

      mapsTasksIds[task.id] = taskCreated.id;
    }

    return valueChainCreated;
  }
}
