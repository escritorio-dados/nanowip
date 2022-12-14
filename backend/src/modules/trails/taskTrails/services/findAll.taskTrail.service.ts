import { Injectable } from '@nestjs/common';
import ELK from 'elkjs';

import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';

import { TaskTrail } from '../entities/TaskTrail';
import { FindAllGraphTaskTrailsQuery } from '../query/findAllGraph.taskTrails.query';
import { FindAllLimitedTaskTrailsQuery } from '../query/findAllLimited.taskTrails.query';
import { TaskTrailsRepository } from '../repositories/taskTrails.repository';

type IFindAllGraph = FindAllGraphTaskTrailsQuery & { organization_id: string };

type IEdge = { id: string; source: string; target: string };
type INode<T> = { id: string; data: T; height?: number; width?: number };

@Injectable()
export class FindAllTaskTrailService {
  constructor(private taskTrailsRepository: TaskTrailsRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedTaskTrailsQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['taskTrail.'],
      },
    ];

    const tasks = await this.taskTrailsRepository.findAllLimited({
      organization_id,
      filters,
      trail_id: query.trail_id,
    });

    return tasks;
  }

  async findAllGraph({ organization_id, trail_id, node_height, node_width }: IFindAllGraph) {
    const tasks = await this.taskTrailsRepository.findAllGraph({
      organization_id,
      trail_id,
    });

    const edgesDuplicated: IEdge[] = [];

    const nodes: INode<TaskTrail>[] = [];

    tasks.forEach(task => {
      nodes.push({
        id: task.id,
        width: node_width,
        height: node_height,
        data: {
          ...task,
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
      });

      task.nextTasks.forEach(nextTask => {
        edgesDuplicated.push({
          source: task.id,
          target: nextTask.id,
          id: `${task.id}-${nextTask.id}`,
        });
      });
    });

    const edges = edgesDuplicated.filter(
      (value, index, array) => array.findIndex(value2 => value2.id === value.id) === index,
    );

    // Calculando o posicionamento
    await new ELK().layout(
      {
        id: trail_id,
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
