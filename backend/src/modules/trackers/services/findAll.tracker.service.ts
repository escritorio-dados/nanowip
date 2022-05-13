import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { paginationSize } from '@shared/types/pagination';
import { ICustomFilters, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { getParentPath } from '@shared/utils/getParentPath';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { FindAllAssignmentService } from '@modules/assignments/services/findAll.assignment.service';
import { User } from '@modules/users/entities/User';
import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

import { Tracker } from '../entities/Tracker';
import { trackerErrors } from '../errors/tracker.errors';
import { FindPaginationTrackerQuery } from '../query/findPagination.tracker.query';
import { FindPersonalTrackerQuery } from '../query/findPersonal.tracker.query';
import { TrackersRepository } from '../repositories/trackers.repository';

type IFindAllTrackerService = {
  organization_id: string;
  onlyLooses?: boolean;
  user?: User;

  collaborator_id?: string;
  assignment_id?: string;
  task_id?: string;
  assignmentStatus?: string;
  assignments_id?: string[];
  date?: Date;
};

type IFindAllPagination = { query: FindPaginationTrackerQuery; organization_id: string };
type IFindAllPersonal = { query: FindPersonalTrackerQuery; user: User };

type IConfigFilters = { query: FindPaginationTrackerQuery | FindPersonalTrackerQuery };

@Injectable()
export class FindAllTrackerService {
  constructor(
    private trackersRepository: TrackersRepository,
    private findAllAssignmentService: FindAllAssignmentService,
  ) {}

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

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
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

  async execute({
    organization_id,
    assignmentStatus,
    assignment_id,
    assignments_id,
    collaborator_id,
    date,
    task_id,
    onlyLooses,
    user,
  }: IFindAllTrackerService): Promise<Tracker[]> {
    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_tracker]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_tracker]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (!collaborator_id) {
          throw new AppError(trackerErrors.personalAccessAnotherUser);
        }

        if (user.collaborator.id !== collaborator_id) {
          throw new AppError(trackerErrors.personalAccessAnotherUser);
        }
      }
    }

    let trackers: Tracker[] = [];

    // Pegando todos os trackers de uma tarefa
    if (task_id) {
      const assignments = await this.findAllAssignmentService.execute({
        task_id,
        organization_id,
      });

      const ids = assignments.map(({ id }) => id);

      trackers = await this.trackersRepository.findAllByManyAssignments(ids);
    }

    // Pegando todos os tracker de varias atribuições
    else if (assignments_id) {
      trackers = await this.trackersRepository.findAllByManyAssignments(assignments_id);
    }

    // Pegando todos os tracker de um colaborador em especifico
    else if (collaborator_id) {
      // Dentro de uma data especifica
      if (date) {
        trackers = await this.trackersRepository.findAllByDateCollaborator(collaborator_id, date);
      }

      // Todos que não estão atribuidos a uma tarefa
      else if (onlyLooses) {
        trackers = await this.trackersRepository.findAllLooseByCollaborator(collaborator_id);
      }

      // Todos de um colaborador
      else {
        trackers = await this.trackersRepository.findAllByCollaborator(
          collaborator_id,
          assignmentStatus,
        );
      }
    }

    // trackers de uma atribuição
    else if (assignment_id) {
      trackers = await this.trackersRepository.findAllByAssignment(assignment_id);
    }

    // Em uma data especifica
    else if (date) {
      trackers = await this.trackersRepository.findAllByDate({ date, organization_id });
    }

    // Todos de uma organização
    else {
      trackers = await this.trackersRepository.findAll({ organization_id });
    }

    if (trackers.length > 0) {
      validateOrganization({ entity: trackers[0], organization_id });
    }

    return trackers;
  }
}
