import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { DeleteTagsGroupService } from '@modules/tags/tagsGroups/services/delete.tagsGroup.service';

import { TaskTrailsRepository } from '../repositories/taskTrails.repository';
import { CommonTaskTrailService } from './common.taskTrail.service';

type IDeleteTaskTrailService = { id: string; organization_id: string };

type IDeleteMany = { ids: string[]; organization_id: string };

@Injectable()
export class DeleteTaskTrailService {
  constructor(
    @InjectConnection() private connection: Connection,

    private taskTrailsRepository: TaskTrailsRepository,
    private commonTaskTrailService: CommonTaskTrailService,

    private deleteTagsGroupService: DeleteTagsGroupService,
  ) {}

  async deleteMany({ ids, organization_id }: IDeleteMany, manager?: EntityManager) {
    const tasks = await this.taskTrailsRepository.findAllByKeys({
      ids,
      key: 'id',
      organization_id,
    });

    const tagsGroupsIds = tasks.map(task => task.tags_group_id);

    await this.deleteTagsGroupService.deleteMany({ ids: tagsGroupsIds, organization_id }, manager);

    await this.taskTrailsRepository.deleteMany(tasks, manager);
  }

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

    await this.connection.transaction(async manager => {
      if (task.tags_group_id) {
        await this.deleteTagsGroupService.execute(
          { id: task.tags_group_id, organization_id },
          manager,
        );
      }

      await this.taskTrailsRepository.saveAll(previousTasksFixed, manager);

      // Deletando do banco de dados
      await this.taskTrailsRepository.delete(task, manager);
    });
  }
}
