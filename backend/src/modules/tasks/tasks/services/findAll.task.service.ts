import { Injectable } from '@nestjs/common';
import ELK from 'elkjs';

import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';

import { Task } from '../entities/Task';
import { FindAllGraphTasksQuery } from '../query/findAllGraph.tasks.query';
import { FindAllLimitedTasksQuery } from '../query/findAllLimited.tasks.query';

type IFindAllTaskService = {
  organization_id: string;
  value_chain_id?: string;

  value_chains_id?: string[];

  task_type_id?: string;

  task_id?: string;
};

type IFindAllGraph = FindAllGraphTasksQuery & { organization_id: string };
type IFindAllLimited = { query: FindAllLimitedTasksQuery; organization_id: string };

type IEdge = { id: string; source: string; target: string };
type INode<T> = { id: string; data: T; height?: number; width?: number };

type ITaskInfo = Task & { assignmentsQtd?: number };

@Injectable()
export class FindAllTaskService {
  constructor(private tasksRepository: TasksRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['task.'],
      },
    ];

    const tasks = await this.tasksRepository.findAllLimited({
      organization_id,
      filters,
      value_chain_id: query.value_chain_id,
    });

    return tasks.map(task => ({
      ...task,
      pathString: getParentPathString({
        entity: task,
        getProduct: true,
        entityType: 'task',
      }),
      valueChain: undefined,
    }));
  }

  async findAllGraph({ organization_id, value_chain_id, node_height, node_width }: IFindAllGraph) {
    const tasks = await this.tasksRepository.findAllGraph({
      organization_id,
      value_chain_id,
    });

    const edgesDuplicated: IEdge[] = [];

    const nodes: INode<ITaskInfo>[] = [];

    const extra_tasks_id_set = new Set<string>();

    tasks.forEach(task => {
      nodes.push({
        id: task.id,
        width: node_width,
        height: node_height,
        data: {
          ...task,
          statusDate: getStatusDate(task),
          assignmentsQtd: task.assignments.length,
          assignments: undefined,
          deadline: undefined,
          startDate: undefined,
          endDate: undefined,
          availableDate: undefined,
          nextTasks: undefined,
          previousTasks: undefined,
        },
      });

      task.previousTasks.forEach(previousTask => {
        edgesDuplicated.push({
          source: previousTask.id,
          target: task.id,
          id: `${previousTask.id}-${task.id}`,
        });

        if (value_chain_id !== previousTask.value_chain_id) {
          extra_tasks_id_set.add(previousTask.id);
        }
      });

      task.nextTasks.forEach(nextTask => {
        edgesDuplicated.push({
          source: task.id,
          target: nextTask.id,
          id: `${task.id}-${nextTask.id}`,
        });

        if (value_chain_id !== nextTask.value_chain_id) {
          extra_tasks_id_set.add(nextTask.id);
        }
      });
    });

    const edges = edgesDuplicated.filter(
      (value, index, array) => array.findIndex(value2 => value2.id === value.id) === index,
    );

    const extra_task_ids = Array.from(extra_tasks_id_set);

    const extraTasks = await this.tasksRepository.findExtraGraph({ extra_task_ids });

    nodes.push(
      ...extraTasks.map(task => {
        return {
          id: task.id,
          width: node_width,
          height: node_height,
          data: {
            ...task,
            statusDate: getStatusDate(task),
            pathString: getParentPathString({
              entity: task,
              entityType: 'task',
              getProduct: true,
              skipFirstName: true,
            }),
            value_chain_id: task.valueChain.id,
            valueChain: undefined,
            deadline: undefined,
            startDate: undefined,
            endDate: undefined,
            availableDate: undefined,
          },
        };
      }),
    );

    // Calculando o posicionamento
    await new ELK().layout(
      {
        id: value_chain_id,
        children: nodes,
        edges: edges.map(edge => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
      },
      {
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'RIGHT',
          'elk.spacing.nodeNode': '25',
          'elk.separateConnectedComponents': 'false',
        },
      },
    );

    return {
      nodes,
      edges,
    };
  }

  async execute({
    organization_id,
    task_id,
    task_type_id,
    value_chain_id,
    value_chains_id,
  }: IFindAllTaskService) {
    // Pegando todas as tarefas de uma cadeia de valor
    if (value_chain_id) {
      const tasks = await this.tasksRepository.findAllByValueChainOld(value_chain_id);

      if (tasks.length > 0) {
        validateOrganization({ entity: tasks[0], organization_id });
      }

      return tasks;
    }

    // Pegando todas as tarefas de varias cadeias de valor
    if (value_chains_id) {
      const tasks = await this.tasksRepository.findAllByManyValueChain(value_chains_id);

      if (tasks.length > 0) {
        validateOrganization({ entity: tasks[0], organization_id });
      }

      return tasks;
    }

    // Pegando todas as tarefas de um tipo especifico
    if (task_type_id) {
      const tasks = await this.tasksRepository.findAllByTaskType(task_type_id);

      if (tasks.length > 0) {
        validateOrganization({ entity: tasks[0], organization_id });
      }

      return tasks;
    }

    // Pegando todas as tarefas dependentes de uma especifica
    if (task_id) {
      const tasks = await this.tasksRepository.findAllNextTasks(task_id);

      if (tasks.length > 0) {
        validateOrganization({ entity: tasks[0], organization_id });
      }

      return tasks;
    }

    // pegando todas as tarefas de uma organização
    return this.tasksRepository.findAll({ organization_id });
  }
}
