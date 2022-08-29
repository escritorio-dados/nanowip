import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { AppError } from '@shared/errors/AppError';

import { DeleteTagsGroupService } from '@modules/tags/tagsGroups/services/delete.tagsGroup.service';
import { FixDatesValueChainService } from '@modules/valueChains/services/fixDates.valueChain.service';

import { taskErrors } from '../errors/task.errors';
import { TasksRepository } from '../repositories/tasks.repository';
import { CommonTaskService } from './common.task.service';

type IDeleteTaskService = { id: string; organization_id: string };

type IDeleteMany = { ids: string[]; organization_id: string };

@Injectable()
export class DeleteTaskService {
  constructor(
    @InjectConnection() private connection: Connection,

    private tasksRepository: TasksRepository,
    private commonTaskService: CommonTaskService,

    private fixDatesValueChainService: FixDatesValueChainService,
    private deleteTagsGroupService: DeleteTagsGroupService,
  ) {}

  async deleteMany({ ids, organization_id }: IDeleteMany) {
    const tasks = await this.tasksRepository.findAllByKeys({
      ids,
      key: 'id',
      relations: ['assignments'],
      organization_id,
    });

    const someAssignment = tasks.some(task => task.assignments.length > 0);

    if (someAssignment) {
      throw new AppError(taskErrors.deleteWithAssignments);
    }

    const tagsGroupsIds = tasks.map(task => task.tags_group_id);

    await this.connection.transaction(async manager => {
      await this.deleteTagsGroupService.deleteMany(
        { ids: tagsGroupsIds, organization_id },
        manager,
      );

      await this.tasksRepository.deleteMany(tasks, manager);
    });

    // Essa função não precisa mexer com as datas acima, somente se ela só for usada para deletar todas
    // as tarefas de uma cadeia de valor de uma vez
  }

  async execute({ id, organization_id }: IDeleteTaskService) {
    const task = await this.tasksRepository.findToDelete(id);

    this.commonTaskService.validateTask({ task, organization_id });

    // Impedindo de deletar com atribuições
    if (task.assignments.length > 0) {
      throw new AppError(taskErrors.deleteWithAssignments);
    }

    // Ajustando as dependencias
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

      await this.tasksRepository.saveAll(previousTasksFixed, manager);

      // Deletando do banco de dados
      await this.tasksRepository.delete(task, manager);
    });

    // Arrumando as data da cadeia de valor...
    await this.fixDatesValueChainService.recalculateDates(task.value_chain_id, 'full');
  }
}
