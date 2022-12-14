import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { AppError } from '@shared/errors/AppError';
import { DatesController } from '@shared/utils/ServiceDatesController';
import { validadeDates } from '@shared/utils/validadeDates';

import { CloseAssignmentsTaskService } from '@modules/assignments/services/closeAssignmentsTask.service';
import { UpdateTagsGroupService } from '@modules/tags/tagsGroups/services/update.tagsGroup.service';
import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';
import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';
import { FixDatesValueChainService } from '@modules/valueChains/services/fixDates.valueChain.service';

import { UpdateNoDepedencyTaskDto } from '../dtos/updateNoDepedency.task.dto';
import { UpdateTaskDto } from '../dtos/updateTask.dto';
import { taskErrors } from '../errors/task.errors';
import { CommonTaskService } from './common.task.service';
import { FixDatesTaskService } from './fixDates.task.service';

type IUpdateTaskService = UpdateTaskDto & { organization_id: string; id: string };
type IUpdateNoDepedenciesTaskService = UpdateNoDepedencyTaskDto & {
  organization_id: string;
  id: string;
};

type IRemoveExternalDependencies = { value_chain_id: string; organization_id: string };

@Injectable()
export class UpdateTaskService {
  constructor(
    @InjectConnection() private connection: Connection,

    private tasksRepository: TasksRepository,
    private commonTaskService: CommonTaskService,
    private fixDatesTaskService: FixDatesTaskService,

    private findOneTaskTypeService: FindOneTaskTypeService,
    private fixDatesValueChainService: FixDatesValueChainService,
    private closeAssignmentsTaskService: CloseAssignmentsTaskService,
    private updateTagsGroupService: UpdateTagsGroupService,
  ) {}

  async removeExternalDependencies({
    value_chain_id,
    organization_id,
  }: IRemoveExternalDependencies) {
    const tasks = await this.tasksRepository.findAllByKeys({
      ids: [value_chain_id],
      key: 'value_chain_id',
      organization_id,
      relations: ['nextTasks', 'previousTasks'],
    });

    const tasksToChange = tasks.filter(task => {
      const externalPrevious = task.previousTasks.some(
        prevTask => prevTask.value_chain_id !== value_chain_id,
      );

      const externalNext = task.nextTasks.some(
        nextTask => nextTask.value_chain_id !== value_chain_id,
      );

      return externalPrevious || externalNext;
    });

    const tasksChanged = tasksToChange.map(task => {
      const newPrevious = task.previousTasks.filter(
        prevTask => prevTask.value_chain_id === value_chain_id,
      );

      const newNext = task.nextTasks.filter(nextTask => nextTask.value_chain_id === value_chain_id);

      return {
        ...task,
        nextTasks: newNext,
        previousTasks: newPrevious,
      };
    });

    await this.tasksRepository.saveAll(tasksChanged);
  }

  async updateNoDependecies({
    id,
    name,
    task_type_id,
    availableDate,
    deadline,
    endDate,
    startDate,
    organization_id,
    description,
    link,
    tags,
  }: IUpdateNoDepedenciesTaskService) {
    const task = await this.commonTaskService.getTask({
      id,
      organization_id,
      relations: ['nextTasks', 'previousTasks'],
    });

    task.description = description;
    task.link = link;

    // Variavel de controle das datas
    const datesController = new DatesController({
      available: task.availableDate,
      start: task.startDate,
      end: task.endDate,
    });

    // Validando e mudando datas (Algumas valida????es v??o ocorrer na hora de validar tarefa anterior)
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    // Validando e alterando o nome o nome
    if (task.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonTaskService.validadeName(name, task.value_chain_id);
    }

    task.name = name.trim();

    // Validando e alterando o tipo de tarefa
    if (task.task_type_id !== task_type_id) {
      task.taskType = await this.findOneTaskTypeService.execute({
        id: task_type_id,
        organization_id,
      });
    }

    // Atribuindo as datas de prazo e inicio
    task.deadline = deadline;
    task.startDate = startDate;
    task.availableDate = availableDate;
    task.endDate = endDate;

    const taskUpdated = await this.connection.transaction(async manager => {
      // Atualizar tags
      task.tags_group_id = await this.updateTagsGroupService.updateTags(
        {
          organization_id,
          newTags: tags,
          tags_group_id: task.tags_group_id,
        },
        manager,
      );

      // Salvando altera????es na tarefa
      return this.tasksRepository.save(task, manager);
    });

    // Causando os efeitos colaterais
    datesController.updateDates({
      available: taskUpdated.availableDate,
      start: taskUpdated.startDate,
      end: taskUpdated.endDate,
    });

    if (datesController.needChangeDates()) {
      if (datesController.changed('end')) {
        await this.fixDatesTaskService.ajustNextDates(taskUpdated.id);

        if (taskUpdated.endDate) {
          await this.closeAssignmentsTaskService.execute({
            task_id: taskUpdated.id,
            endDate: taskUpdated.endDate,
          });
        }
      }

      await this.fixDatesValueChainService.recalculateDates(
        taskUpdated.value_chain_id,
        datesController.getMode(),
      );
    }

    return taskUpdated;
  }

  async execute({
    id,
    name,
    task_type_id,
    previous_tasks_ids,
    next_tasks_ids,
    availableDate,
    deadline,
    endDate,
    startDate,
    organization_id,
    description,
    link,
    tags,
  }: IUpdateTaskService) {
    const task = await this.commonTaskService.getTask({ id, organization_id });

    task.description = description;
    task.link = link;

    // Variavel de controle das datas
    const datesController = new DatesController({
      available: task.availableDate,
      start: task.startDate,
      end: task.endDate,
    });

    // Validando e mudando datas (Algumas valida????es v??o ocorrer na hora de validar tarefa anterior)
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    // Validando e alterando o nome o nome
    if (task.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonTaskService.validadeName(name, task.value_chain_id);
    }

    task.name = name.trim();

    // Validando Dependencias
    const circularDependency =
      previous_tasks_ids.some(prev_id => next_tasks_ids.includes(prev_id) || prev_id === task.id) ||
      next_tasks_ids.includes(task.id);

    if (circularDependency) {
      throw new AppError(taskErrors.circularDependency);
    }

    task.previousTasks = await this.commonTaskService.resolvePreviousTasks({
      availableDate,
      previous_tasks_ids,
      organization_id,
    });

    task.nextTasks = await this.commonTaskService.resolveNextTasks({
      endDate,
      next_tasks_ids,
      organization_id,
    });

    // Validando e alterando o tipo de tarefa
    if (task.task_type_id !== task_type_id) {
      task.taskType = await this.findOneTaskTypeService.execute({
        id: task_type_id,
        organization_id,
      });
    }

    // Atribuindo as datas de prazo e inicio
    task.deadline = deadline;
    task.startDate = startDate;
    task.availableDate = availableDate;
    task.endDate = endDate;

    const taskUpdated = await this.connection.transaction(async manager => {
      // Atualizar tags
      task.tags_group_id = await this.updateTagsGroupService.updateTags(
        {
          organization_id,
          newTags: tags,
          tags_group_id: task.tags_group_id,
        },
        manager,
      );

      // Salvando altera????es na tarefa
      return this.tasksRepository.save(task, manager);
    });

    // Causando os efeitos colaterais
    datesController.updateDates({
      available: taskUpdated.availableDate,
      start: taskUpdated.startDate,
      end: taskUpdated.endDate,
    });

    if (datesController.needChangeDates()) {
      if (datesController.changed('end')) {
        await this.fixDatesTaskService.ajustNextDates(taskUpdated.id);

        if (taskUpdated.endDate) {
          await this.closeAssignmentsTaskService.execute({
            task_id: taskUpdated.id,
            endDate: taskUpdated.endDate,
          });
        }
      }

      await this.fixDatesValueChainService.recalculateDates(
        taskUpdated.value_chain_id,
        datesController.getMode(),
      );
    }

    return taskUpdated;
  }
}
