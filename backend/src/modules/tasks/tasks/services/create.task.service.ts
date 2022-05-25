import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { ServiceDatesController } from '@shared/utils/ServiceDatesController';
import { validadeDates } from '@shared/utils/validadeDates';

import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';
import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';
import { FindOneValueChainService } from '@modules/valueChains/services/findOne.valueChain.service';
import { FixDatesValueChainService } from '@modules/valueChains/services/fixDates.valueChain.service';

import { ICreateTaskRepositoryDto } from '../dtos/create.task.repository.dto';
import { CreateTaskDto } from '../dtos/createTask.dto';
import { taskErrors } from '../errors/task.errors';
import { CommonTaskService } from './common.task.service';
import { FixDatesTaskService } from './fixDates.task.service';

type ICreateTaskService = CreateTaskDto & { organization_id: string };

@Injectable()
export class CreateTaskService {
  constructor(
    private tasksRepository: TasksRepository,
    private commonTaskService: CommonTaskService,
    private fixDatesTaskService: FixDatesTaskService,

    private findOneValueChainService: FindOneValueChainService,
    private findOneTaskTypeService: FindOneTaskTypeService,
    private fixDatesValueChainService: FixDatesValueChainService,
  ) {}

  async execute({
    name,
    value_chain_id,
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
  }: ICreateTaskService) {
    const newTask: ICreateTaskRepositoryDto = {
      organization_id,
      description,
      link,
    } as ICreateTaskRepositoryDto;

    // Validando e atribuindo as datas
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    newTask.deadline = deadline;
    newTask.availableDate = availableDate;
    newTask.startDate = startDate;
    newTask.endDate = endDate;

    if (!newTask.availableDate && previous_tasks_ids.length === 0) {
      newTask.availableDate = new Date();
    }

    // Validando e atribuindo a cadeia de valor
    newTask.valueChain = await this.findOneValueChainService.execute({
      id: value_chain_id,
      organization_id,
    });

    // Validando e atribuindo o nome
    await this.commonTaskService.validadeName(name, value_chain_id);

    newTask.name = name.trim();

    // Validando e atribuindo o tipo de tarefa
    newTask.taskType = await this.findOneTaskTypeService.execute({
      id: task_type_id,
      organization_id,
    });

    // Validando as tarefas anteriores e posteriores
    const circularDependency = previous_tasks_ids.some(prev_id => next_tasks_ids.includes(prev_id));

    if (circularDependency) {
      throw new AppError(taskErrors.circularDependency);
    }

    newTask.previousTasks = await this.commonTaskService.resolvePreviousTasks({
      availableDate,
      previous_tasks_ids,
      organization_id,
    });

    newTask.nextTasks = await this.commonTaskService.resolveNextTasks({
      endDate,
      next_tasks_ids,
      organization_id,
    });

    const task = await this.tasksRepository.create(newTask);

    const serviceDateController = new ServiceDatesController(task);

    // Mudando as datas nas dependentes
    if (task.nextTasks.length !== 0) {
      await this.fixDatesTaskService.ajustNextDates(task.id);
    }

    // Corrigindo as datas da cadeia de valor
    await this.fixDatesValueChainService.verifyDatesChanges({
      value_chain_id,
      ...serviceDateController.getCreateParams(),
    });

    return task;
  }
}
