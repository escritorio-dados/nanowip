import { Injectable } from '@nestjs/common';

import { paginationSize } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { ICustomFilters, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { getParentPath } from '@shared/utils/getParentPath';

import { User } from '@modules/users/users/entities/User';

import { FindPaginationTrackerQuery } from '../query/findPagination.tracker.query';
import { FindPersonalTrackerQuery } from '../query/findPersonal.tracker.query';
import { TrackersRepository } from '../repositories/trackers.repository';

type IFindByAssignments = { organization_id: string; assignments_id: string[] };

type IFindAllPersonal = { query: FindPersonalTrackerQuery; user: User };

type IConfigFilters = { query: FindPaginationTrackerQuery | FindPersonalTrackerQuery };

@Injectable()
export class FindAllTrackerService {
  constructor(private trackersRepository: TrackersRepository) {}

  private sortConfig: ISortConfig = {
    id: { field: 'id', alias: ['tracker.'] },
    task: { field: 'name', alias: ['task.'] },
    product: { field: 'name', alias: ['product'] },
    reason: { field: 'reason', alias: ['tracker.'] },
    collaborator: { field: 'name', alias: ['collaborator.'] },
    start: { field: 'start', alias: ['tracker.'] },
    end: { field: 'end', alias: ['tracker.'] },
    updated_at: { field: 'updated_at', alias: ['tracker.'] },
    created_at: { field: 'created_at', alias: ['tracker.'] },
  };

  private configFilters({ query }: IConfigFilters) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.task],
        operation: 'like',
        alias: ['task.'],
      },
      {
        field: 'status',
        values: [query.status],
        operation: 'equal',
        alias: ['assignment.'],
      },
      {
        field: 'reason',
        values: [query.reason],
        operation: 'like',
        alias: ['tracker.'],
      },
      {
        field: 'name',
        values: [query.local],
        operation: 'like',
        alias: [
          'projectParent.',
          'customer.',
          'projectParentCustomer.',
          'productParent.',
          'project.',
          'productParentProject.',
          'productParentProjectCustomer.',
          'productParentProjectProjectParent.',
          'productParentProjectProjectParentCustomer.',
          'product.',
          'valueChain.',
        ],
      },
      {
        field: 'start',
        ...configRangeFilterAlias({ min_value: query.min_start, max_value: query.max_start }),
        alias: ['tracker.'],
      },
      {
        field: 'end',
        ...configRangeFilterAlias({ min_value: query.min_end, max_value: query.max_end }),
        alias: ['tracker.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['tracker.'],
      },
    ];

    return filters;
  }

  async findAllPersonal({ query, user }: IFindAllPersonal) {
    if (!user.collaborator) {
      return {
        pagination: {
          page: query.page,
          total_results: 0,
          total_pages: 0,
        },
        data: [],
      };
    }

    const filters = this.configFilters({ query });

    const sort = this.sortConfig[query.sort_by];

    const customFilters: ICustomFilters = [];

    if (query.in_progress) {
      customFilters.push('tracker.end is null');
    }

    switch (query.type) {
      case 'Vinculado': {
        customFilters.push('tracker.assignment_id is not null');

        break;
      }
      case 'Solto': {
        customFilters.push('tracker.assignment_id is null');

        break;
      }
      default:
        break;
    }

    const [trackers, total_results] = await this.trackersRepository.findAllPersonal({
      collaborator_id: user.collaborator.id,
      organization_id: user.organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters,
    });

    const trackersFormatted = trackers.map(tracker => {
      const path = tracker.assignment_id
        ? getParentPath({
            entity: tracker.assignment.task,
            getCustomer: true,
            entityType: 'task',
            includeEntity: true,
          })
        : undefined;

      return {
        ...tracker,
        path,
        assignment: undefined,
        assignment_id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
    });

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: trackersFormatted,
    };
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindPaginationTrackerQuery>) {
    const filters = this.configFilters({ query });

    filters.push({
      field: 'collaborator_id',
      values: [query.collaborator_id],
      operation: 'equal',
      alias: ['tracker.'],
    });

    const sort = this.sortConfig[query.sort_by];

    const customFilters: ICustomFilters = [];

    if (query.in_progress) {
      customFilters.push('tracker.end is null');
    }

    switch (query.type) {
      case 'Vinculado': {
        customFilters.push('tracker.assignment_id is not null');

        break;
      }
      case 'Solto': {
        customFilters.push('tracker.assignment_id is null');

        break;
      }
      default:
        break;
    }

    const [trackers, total_results] = await this.trackersRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters,
    });

    const trackersFormatted = trackers.map(tracker => {
      const path = tracker.assignment_id
        ? getParentPath({
            entity: tracker.assignment.task,
            getCustomer: true,
            entityType: 'task',
            includeEntity: true,
          })
        : undefined;

      return {
        ...tracker,
        path,
        assignment: undefined,
        assignment_id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
    });

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: trackersFormatted,
    };
  }

  async findByAssignments({ organization_id, assignments_id }: IFindByAssignments) {
    const trackers = await this.trackersRepository.findAllByManyAssignments(
      assignments_id,
      organization_id,
    );

    return trackers;
  }
}
