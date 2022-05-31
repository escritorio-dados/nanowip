import { Injectable } from '@nestjs/common';
import { differenceInSeconds } from 'date-fns';
import { Brackets } from 'typeorm';

import { AppError } from '@shared/errors/AppError';
import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { ICustomFilters, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { User } from '@modules/users/entities/User';
import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

import { Assignment } from '../entities/Assignment';
import { StatusAssignment } from '../enums/status.assignment.enum';
import { assignmentErrors } from '../errors/assignment.errors';
import { FindAllLimitedAssignmentsQuery } from '../query/findAllLimited.assignment.query';
import { FindByTaskAssignmentQuery } from '../query/findByTask.assignment.query';
import { FindPaginationAssignmentQuery } from '../query/findPagination.assignment.query';
import { FindPaginationCloseAssignmentQuery } from '../query/findPaginationClose.assignment.query';
import { AssignmentsRepository } from '../repositories/assignments.repository';

type IFindAllAssignmentService = {
  organization_id: string;
  recentClose?: boolean;
  user?: User;
  collaborator_id?: string;
  task_id?: string;
  tasks_id?: string[];
  status?: StatusAssignment;
  onlyAvailable?: boolean;
};

type IFindAllPagination = { query: FindPaginationAssignmentQuery; organization_id: string };
type IFindAllLimited = {
  query: FindAllLimitedAssignmentsQuery;
  organization_id: string;
  collaborator_id?: string;
};

type IFindAllByTask = FindByTaskAssignmentQuery & { organization_id: string };

type IFindAvailablePersonal = { user: User };

type IFindClosedPersonalPagination = { user: User; query: FindPaginationCloseAssignmentQuery };

@Injectable()
export class FindAllAssignmentService {
  constructor(private assignmentsRepository: AssignmentsRepository) {}

  async findAllByTask({ organization_id, task_id }: IFindAllByTask) {
    const assignments = await this.assignmentsRepository.findAllByTaskInfo({
      task_id,
      organization_id,
    });

    return assignments;
  }

  async findAvailablePersonal({ user }: IFindAvailablePersonal) {
    if (!user.collaborator) {
      return [];
    }

    const assignments = await this.assignmentsRepository.findAvailablePersonal({
      collaborator_id: user.collaborator.id,
      organization_id: user.organization_id,
    });

    return assignments
      .filter(assignment => !assignment.trackers.some(({ end }) => !end))
      .map(assignment => {
        const durationSeconds = assignment.trackers.reduce((total, tracker) => {
          return total + differenceInSeconds(tracker.end, tracker.start);
        }, 0);

        return {
          ...assignment,
          deadline: assignment.task.deadline,
          description: assignment.task.description,
          link: assignment.task.link,
          duration: durationSeconds,
          path: getParentPath({
            entity: assignment.task,
            getCustomer: true,
            entityType: 'task',
            includeEntity: true,
          }),
          task: undefined,
          trackers: undefined,
        };
      });
  }

  async findClosedPersonal({ user, query }: IFindClosedPersonalPagination) {
    if (!user.collaborator) {
      return [];
    }

    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.task],
        operation: 'like',
        alias: ['task.'],
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
        field: 'end_date',
        ...configRangeFilterAlias({ min_value: query.min_end, max_value: query.max_end }),
        alias: ['assignment.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['assignment.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['product.'] },
      task: { field: 'name', alias: ['task.'] },
      product: { field: 'name', alias: ['product.'] },
      end_date: { field: 'endDate', alias: ['assignment.'] },
      updated_at: { field: 'updated_at', alias: ['assignment.'] },
      created_at: { field: 'created_at', alias: ['assignment.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [
      assignments,
      total_results,
    ] = await this.assignmentsRepository.findClosedPersonalPagination({
      collaborator_id: user.collaborator.id,
      organization_id: user.organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const assignmentsFormatted = assignments.map(assignment => {
      return {
        ...assignment,
        path: getParentPath({
          entity: assignment.task,
          getCustomer: true,
          entityType: 'task',
          includeEntity: true,
        }),
        pathString: getParentPathString({
          entity: assignment.task,
          getCustomer: true,
          entityType: 'task',
          skipFirstName: false,
        }),
        task: undefined,
      };
    });

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: assignmentsFormatted,
    };
  }

  async findAllLimited({ organization_id, query, collaborator_id }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
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
          'task.',
        ],
      },
    ];

    const assignments = await this.assignmentsRepository.findAllLimitedOpen({
      organization_id,
      collaborator_id: collaborator_id || query.collaborator_id,
      filters,
    });

    return assignments.map(assignment => ({
      ...assignment,
      path: getParentPath({
        entity: assignment.task,
        getCustomer: true,
        entityType: 'task',
        includeEntity: true,
      }),
      pathString: getParentPathString({
        entity: assignment.task,
        getCustomer: true,
        entityType: 'task',
        skipFirstName: false,
      }),
      task: undefined,
    }));
  }

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
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
        field: 'collaborator_id',
        values: [query.collaborator_id],
        operation: 'equal',
        alias: ['assignment.'],
      },
      {
        field: 'start_date',
        ...configRangeFilterAlias({ min_value: query.min_start, max_value: query.max_start }),
        alias: ['assignment.'],
      },
      {
        field: 'end_date',
        ...configRangeFilterAlias({ min_value: query.min_end, max_value: query.max_end }),
        alias: ['assignment.'],
      },
      {
        field: 'deadline',
        ...configRangeFilterAlias({ min_value: query.min_deadline, max_value: query.max_deadline }),
        alias: ['task.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['assignment.'],
      },
    ];
    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['product.'] },
      task: { field: 'name', alias: ['task.'] },
      collaborator: { field: 'name', alias: ['collaborator.'] },
      start_date: { field: 'startDate', alias: ['assignment.'] },
      end_date: { field: 'endDate', alias: ['assignment.'] },
      deadline: { field: 'deadline', alias: ['task.'] },
      updated_at: { field: 'updated_at', alias: ['assignment.'] },
      created_at: { field: 'created_at', alias: ['assignment.'] },
    };

    const sort = sortConfig[query.sort_by];

    const customFilters: ICustomFilters = [
      configStatusDatesFilters({
        statusDate: query.status_date,
        entitiesAlias: ['task.'],
      }),
    ];

    if (query.in_progress) {
      customFilters.push(
        new Brackets(q => {
          q.where(`trackers.end is null`).andWhere('trackers.id is not null');
        }),
      );
    }

    const [assignments, total_results] = await this.assignmentsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters,
    });

    const assignmentsFormatted = assignments.map(assignment => ({
      ...assignment,
      deadline: assignment.task.deadline,
      statusDate: getStatusDate(assignment.task),
      path: getParentPath({
        entity: assignment.task,
        getCustomer: true,
        entityType: 'task',
        includeEntity: true,
      }),
      task: undefined,
      startDate: undefined,
      endDate: undefined,
      created_at: undefined,
      updated_at: undefined,
      trackers: undefined,
    }));

    const apiData: IResponsePagination<Assignment[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: assignmentsFormatted,
    };

    return apiData;
  }

  async execute({
    organization_id,
    collaborator_id,
    onlyAvailable,
    recentClose,
    status,
    task_id,
    tasks_id,
    user,
  }: IFindAllAssignmentService): Promise<Assignment[]> {
    // Validando que o acesso está sendo feito poelo proprio usuario ou por um admin
    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_assignment]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_assignment]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== collaborator_id) {
          throw new AppError(assignmentErrors.personalAccessAnotherUser);
        }
      }
    }

    let assignments: Assignment[] = [];

    // Puxando todas as atribuições por colaborador
    if (collaborator_id) {
      // Que estão disponiveis (Status Aberto)
      if (onlyAvailable) {
        assignments = await this.assignmentsRepository.findAllAvailableByCollaborators(
          collaborator_id,
        );
      }

      // Que foram fechadas nos ultimos 14 dias
      else if (recentClose) {
        assignments = await this.assignmentsRepository.findAllCloseByCollaborators(collaborator_id);
      }

      // Todas de um colaborador
      else {
        assignments = await this.assignmentsRepository.findAllOpenByCollaborators(collaborator_id);
      }
    }

    // Pegando todas as atribuições por status
    else if (status) {
      assignments = await this.assignmentsRepository.findAllByStatus({ status, organization_id });
    }

    // Pegando todas as atribuições por tarefa
    else if (task_id) {
      assignments = await this.assignmentsRepository.findAllByTask(task_id);
    }

    // Pegando todas as atribuições por varias tarefas
    else if (tasks_id) {
      assignments = await this.assignmentsRepository.findAllByManyTask(tasks_id);
    }

    // Pegando todas as atribuições de uma Organização
    else {
      assignments = await this.assignmentsRepository.findAll({ organization_id });
    }

    if (assignments.length > 0) {
      validateOrganization({ entity: assignments[0], organization_id });
    }

    return assignments;
  }
}
