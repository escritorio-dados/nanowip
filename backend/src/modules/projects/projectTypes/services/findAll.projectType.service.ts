import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { ProjectType } from '../entities/ProjectType';
import { FindAllLimitedProjectTypesQuery } from '../query/findAllLimited.projectTypes.query';
import { FindAllPaginationProjectTypesQuery } from '../query/findAllPagination.projectTypes.query';
import { ProjectTypesRepository } from '../repositories/projectTypes.repository';

@Injectable()
export class FindAllProjectTypeService {
  constructor(private projectTypesRepository: ProjectTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedProjectTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['projectType.'],
      },
    ];

    return this.projectTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationProjectTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['projectType.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['projectType.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['projectType.'] },
      name: { field: 'name', alias: ['projectType.'] },
      updated_at: { field: 'updated_at', alias: ['projectType.'] },
      created_at: { field: 'created_at', alias: ['projectType.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [portfolios, total_results] = await this.projectTypesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<ProjectType[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: portfolios,
    };

    return apiData;
  }
}
