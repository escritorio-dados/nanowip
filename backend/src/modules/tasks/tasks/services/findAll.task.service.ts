import { Injectable } from '@nestjs/common';
import ELK from 'elkjs';

import { IStatusDate } from '@shared/enums/statusDate.enum';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { selectFields } from '@shared/utils/selectFields';

import { TasksRepository } from '@modules/tasks/tasks/repositories/tasks.repository';

import { Task } from '../entities/Task';
import { FindAllGraphTasksQuery } from '../query/findAllGraph.tasks.query';
import { FindAllLimitedTasksQuery } from '../query/findAllLimited.tasks.query';

type IFindAllGraph = FindAllGraphTasksQuery & { organization_id: string };

type IEdge = { id: string; source: string; target: string };
type INode<T> = { id: string; data: T; height?: number; width?: number };

type ITaskInfo = Task & { assignmentsQtd?: number; statusDate: IStatusDate };

@Injectable()
export class FindAllTaskService {
  constructor(private tasksRepository: TasksRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedTasksQuery>) {
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
          ...selectFields(task, ['id', 'name']),
          statusDate: getStatusDate(task),
          assignmentsQtd: task.assignments.length,
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
            ...selectFields(task, ['id', 'name']),
            statusDate: getStatusDate(task),
            pathString: getParentPathString({
              entity: task,
              entityType: 'task',
              getProduct: true,
              skipFirstName: true,
            }),
            value_chain_id: task.valueChain.id,
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
}
