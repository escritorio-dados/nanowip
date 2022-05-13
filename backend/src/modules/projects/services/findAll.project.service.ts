import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig, sortSubFunction } from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getDynamicField } from '@shared/utils/getDynamicField';
import { getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Project } from '../entities/Project';
import { FindAllLimitedProjectsQuery } from '../query/findAllLimited.project.query';
import { FindPaginationProjectQuery } from '../query/findPagination.project.query';
import { ProjectsRepository } from '../repositories/projects.repository';

type IFindAllProjectsService = {
  project_parent_id?: string;
  organization_id: string;
  customer_id?: string;

  project_type_id?: string;

  onlyRoot?: boolean;

  portfolio_id?: string;
};

type IFindAllPagination = { query: FindPaginationProjectQuery; organization_id: string };
type IFindAllLimited = {
  query: FindAllLimitedProjectsQuery;
  organization_id: string;
  onlyRoot?: boolean;
};

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
      ...project,
      pathString: getParentPathString({
        entity: project,
        getCustomer: true,
        entityType: 'project',
      }),
      customer: undefined,
      projectParent: undefined,
    }));
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<Project[]>> {
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

    let projectSorted = projects;

    if (sort.subField) {
      projectSorted = projects.map(project => {
        return {
          ...project,
          subprojects: project.subprojects.sort((a, b) => {
            const order = query.order_by === 'ASC' ? 1 : -1;

            return sortSubFunction(
              getDynamicField({ fields: sort.subField, object: a }),
              getDynamicField({ fields: sort.subField, object: b }),
              order,
            );
          }),
        };
      });
    }

    const projectsWithStatus = projectSorted.map(project => ({
      ...project,
      statusDate: getStatusDate(project),
      subprojects: project.subprojects.map(subproject => ({
        ...subproject,
        statusDate: getStatusDate(subproject),
        projectType: undefined,
        portfolios: undefined,
        startDate: undefined,
        deadline: undefined,
        endDate: undefined,
        availableDate: undefined,
        created_at: undefined,
        updated_at: undefined,
      })),
      projectType: undefined,
      portfolios: undefined,
      projectParent: undefined,
      startDate: undefined,
      endDate: undefined,
      deadline: undefined,
      availableDate: undefined,
      created_at: undefined,
      updated_at: undefined,
    }));

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: projectsWithStatus,
    };
  }

  async execute({
    organization_id,
    customer_id,
    onlyRoot,
    portfolio_id,
    project_parent_id,
    project_type_id,
  }: IFindAllProjectsService): Promise<Project[]> {
    let projects: Project[] = [];

    // Pega todos os projetos raiz linkados ao cliente em especifico
    if (customer_id) {
      projects = await this.projectsRepository.findAllByCustomer(customer_id);
    }

    // Pega todos os projetos linkados a um portfolio
    else if (portfolio_id) {
      projects = await this.projectsRepository.findAllByPortfolio(portfolio_id);
    }

    // Pega todos os subprojetos linkados ao projeto pai especifico
    else if (project_parent_id) {
      projects = await this.projectsRepository.findAllByParent(project_parent_id);
    }

    // Pega tods os projetos linkados a um tipo de projeto
    else if (project_type_id) {
      projects = await this.projectsRepository.findAllByProjectType({
        project_type_id,
        onlyRoot,
      });
    }

    // Todos os projetos de uma organização
    else {
      projects = await this.projectsRepository.findAll({ onlyRoot, organization_id });
    }

    if (projects.length > 0) {
      validateOrganization({ entity: projects[0], organization_id });
    }

    return projects;
  }
}
