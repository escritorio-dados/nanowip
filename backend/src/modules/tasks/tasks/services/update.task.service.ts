import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { ServiceDatesController } from '@shared/utils/ServiceDatesController';
import { validadeDates } from '@shared/utils/validadeDates';

import CloseAssignmentsTaskService from '@modules/assignments/services/closeAssignmentsTask.service';
import { Task } from '@modules/tasks/tasks/entities/Task';
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
    private tasksRepository: TasksRepository,
    private commonTaskService: CommonTaskService,
    private fixDatesTaskService: FixDatesTaskService,

    private findOneTaskTypeService: FindOneTaskTypeService,
    private fixDatesValueChainService: FixDatesValueChainService,
    private closeAssignmentsTaskService: CloseAssignmentsTaskService,
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
  }: IUpdateNoDepedenciesTaskService): Promise<Task> {
    const task = await this.commonTaskService.getTask({
      id,
      organization_id,
      relations: ['nextTasks', 'previousTasks'],
    });

    task.description = description;
    task.link = link;

    // Variavel de controle das datas
    const serviceDatesController = new ServiceDatesController(task);

    // Validando e mudando datas (Algumas validações vão ocorrer na hora de validar tarefa anterior)
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

    // Salvando alterações na tarefa
    await this.tasksRepository.save(task);

    // Causando os efeitos colaterais
    serviceDatesController.updateDates(task);

    if (serviceDatesController.needChangeDates()) {
      if (serviceDatesController.changedDate('end')) {
        await this.fixDatesTaskService.ajustNextDates(task.id);

        if (task.endDate) {
          await this.closeAssignmentsTaskService.execute({
            task_id: task.id,
            endDate: task.endDate,
          });
        }
      }

      await this.fixDatesValueChainService.verifyDatesChanges({
        value_chain_id: task.value_chain_id,
        ...serviceDatesController.getUpdateParams(),
      });
    }

    return task;
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
  }: IUpdateTaskService): Promise<Task> {
    const task = await this.commonTaskService.getTask({ id, organization_id });

    task.description = description;
    task.link = link;

    // Variavel de controle das datas
    const serviceDatesController = new ServiceDatesController(task);

    // Validando e mudando datas (Algumas validações vão ocorrer na hora de validar tarefa anterior)
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

    // Salvando alterações na tarefa
    await this.tasksRepository.save(task);

    // Causando os efeitos colaterais
    serviceDatesController.updateDates(task);

    if (serviceDatesController.needChangeDates()) {
      if (serviceDatesController.changedDate('end')) {
        await this.fixDatesTaskService.ajustNextDates(task.id);

        if (task.endDate) {
          await this.closeAssignmentsTaskService.execute({
            task_id: task.id,
            endDate: task.endDate,
          });
        }
      }

      await this.fixDatesValueChainService.verifyDatesChanges({
        value_chain_id: task.value_chain_id,
        ...serviceDatesController.getUpdateParams(),
      });
    }

    return task;
  }
}
