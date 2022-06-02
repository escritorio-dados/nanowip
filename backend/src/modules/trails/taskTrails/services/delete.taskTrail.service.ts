import { Injectable } from '@nestjs/common';

import { TaskTrailsRepository } from '../repositories/taskTrails.repository';
import { CommonTaskTrailService } from './common.taskTrail.service';

type IDeleteTaskTrailService = { id: string; organization_id: string };

@Injectable()
export class DeleteTaskTrailService {
  constructor(
    private taskTrailsRepository: TaskTrailsRepository,
    private commonTaskTrailService: CommonTaskTrailService,
  ) {}

  async execute({ id, organization_id }: IDeleteTaskTrailService) {
    const task = await this.taskTrailsRepository.findToDelete(id);

    this.commonTaskTrailService.validateTask({ task, organization_id });

    const { nextTasks, previousTasks } = task;

    const previousTasksFixed = previousTasks.map(previousTask => {
      const newDependencies = previousTask.nextTasks.filter(pnt => pnt.id !== id);

      newDependencies.push(...nextTasks);

      return {
        ...previousTask,
        nextTasks: newDependencies,
      };
    });

    await this.taskTrailsRepository.saveAll(previousTasksFixed);

    // Deletando do banco de dados
    await this.taskTrailsRepository.delete(task);
  }
}
