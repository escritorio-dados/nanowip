import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { IntegratedObjective } from '../entities/IntegratedObjective';
import { FindAllLimitedIntegratedObjectivesQuery } from '../query/findAllLimited.integratedObjective.query';
import { FindAllPaginationIntegratedObjectivesQuery } from '../query/findAllPagination.integratedObjective.query';
import { IntegratedObjectivesRepository } from '../repositories/integratedObjectives.repository';

@Injectable()
export class FindAllIntegratedObjectiveService {
  constructor(private integratedObjectivesRepository: IntegratedObjectivesRepository) {}

  async findAllLimited({
    organization_id,
    query,
  }: IFindAll<FindAllLimitedIntegratedObjectivesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['integratedObjective.'],
      },
    ];

    return this.integratedObjectivesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationIntegratedObjectivesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['integratedObjective.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['integratedObjective.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['integratedObjective.'] },
      name: { field: 'name', alias: ['integratedObjective.'] },
      updated_at: { field: 'updated_at', alias: ['integratedObjective.'] },
      created_at: { field: 'created_at', alias: ['integratedObjective.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [
      integratedObjectives,
      total_results,
    ] = await this.integratedObjectivesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<IntegratedObjective[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: integratedObjectives,
    };

    return apiData;
  }
}
