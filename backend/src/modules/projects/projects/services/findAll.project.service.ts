import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig, sortSubs } from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { selectFields } from '@shared/utils/selectFields';

import { FindAllLimitedProjectsQuery } from '../query/findAllLimited.project.query';
import { FindPaginationProjectQuery } from '../query/findPagination.project.query';
import { ProjectsRepository } from '../repositories/projects.repository';

type IFindAllLimited = IFindAll<FindAllLimitedProjectsQuery> & { onlyRoot?: boolean };

@Injectable()
export class FindAllProjectService {
  constructor(private projectsRepository: ProjectsRepository) {}

  async findAllLimited({ organization_id, query, onlyRoot }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['project.', 'customer.', 'projectParent.'],
      },
    ];

    const projects = await this.projectsRepository.findAllLimited({
      organization_id,
      filters,
      onlyRoot,
    });

    return projects.map(project => ({
      ...selectFields(project, ['id', 'name']),
      pathString: getParentPathString({
        entity: project,
        getCustomer: true,
        entityType: 'project',
      }),
    }));
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindPaginationProjectQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['project.', 'subprojects.'],
      },
      {
        field: 'customer_id',
        values: [query.customer_id],
        operation: 'equal',
        alias: ['project.'],
      },
      {
        field: 'project_type_id',
        values: [query.project_type_id],
        operation: 'equal',
        alias: ['project.', 'subprojects.'],
      },
      {
        field: 'id',
        values: [query.portfolio_id],
        operation: 'equal',
        alias: ['portfolios.', 'subprojectsPortfolios.'],
      },
      {
        field: 'available_date',
        ...configRangeFilterAlias({
          min_value: query.min_available,
          max_value: query.max_available,
        }),
        alias: ['project.', 'subprojects.'],
      },
      {
        field: 'deadline',
        ...configRangeFilterAlias({ min_value: query.min_deadline, max_value: query.max_deadline }),
        alias: ['project.', 'subprojects.'],
      },
      {
        field: 'start_date',
        ...configRangeFilterAlias({ min_value: query.min_start, max_value: query.max_start }),
        alias: ['project.', 'subprojects.'],
      },
      {
        field: 'end_date',
        ...configRangeFilterAlias({ min_value: query.min_end, max_value: query.max_end }),
        alias: ['project.', 'subprojects.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['project.', 'subprojects.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['project.'], subField: ['id'] },
      name: { field: 'name', alias: ['project.'], subField: ['name'] },
      deadline: { field: 'deadline', alias: ['project.'], subField: ['deadline'] },
      available_date: { field: 'availableDate', alias: ['project.'], subField: ['availableDate'] },
      start_date: { field: 'startDate', alias: ['project.'], subField: ['startDate'] },
      end_date: { field: 'endDate', alias: ['project.'], subField: ['endDate'] },
      updated_at: { field: 'updated_at', alias: ['project.'], subField: ['updated_at'] },
      created_at: { field: 'created_at', alias: ['project.'], subField: ['created_at'] },
      customer: { field: 'name', alias: ['customer.'] },
      project_type: { field: 'name', alias: ['projectType.'], subField: ['projectType', 'name'] },
      portfolio: { field: 'name', alias: ['portfolios.'], subField: ['portfolios[]', 'name'] },
    };

    const sort = sortConfig[query.sort_by];

    const [projects, total_results] = await this.projectsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters: [
        configStatusDatesFilters({
          statusDate: query.status_date,
          entitiesAlias: ['project.', 'subprojects.'],
        }),
      ],
    });

    const projectSorted = sortSubs({
      list: projects,
      order_by: query.order_by,
      sort,
      subfield: 'subprojects',
    });

    const projectsWithStatus = projectSorted.map(project => ({
      ...selectFields(project, ['id', 'name', 'customer']),
      statusDate: getStatusDate(project),
      subprojects: project.subprojects.map(subproject => ({
        ...selectFields(subproject, ['id', 'name']),
        statusDate: getStatusDate(subproject),
      })),
    }));

    const apiData: IResponsePagination<typeof projectsWithStatus> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: projectsWithStatus,
    };

    return apiData;
  }
}
