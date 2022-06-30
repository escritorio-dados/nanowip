import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { getPathObjectives, getPathStringObjectives } from '@shared/utils/getParentPathObjectives';

import { OperationalObjective } from '../entities/OperationalObjective';
import { FindAllLimitedOperationalObjectivesQuery } from '../query/findAllLimited.operationalObjective.query';
import { FindAllPaginationOperationalObjectivesQuery } from '../query/findAllPagination.operationalObjective.query';
import { OperationalObjectivesRepository } from '../repositories/operationalObjectives.repository';

@Injectable()
export class FindAllOperationalObjectiveService {
  constructor(private operationalObjectivesRepository: OperationalObjectivesRepository) {}

  async findAllLimited({
    organization_id,
    query,
  }: IFindAll<FindAllLimitedOperationalObjectivesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['operationalObjective.', 'integratedObjective.'],
      },
    ];

    const operationalObjectives = await this.operationalObjectivesRepository.findAllLimited({
      organization_id,
      filters,
    });

    return operationalObjectives.map(operationalObjective => ({
      ...operationalObjective,
      pathString: getPathStringObjectives({
        entity: operationalObjective,
        entityType: 'operationalObjective',
        getIntegratedObjective: true,
        includeEntity: true,
        skipFirstName: true,
      }),
      path: getPathObjectives({
        entity: operationalObjective,
        entityType: 'operationalObjective',
        getIntegratedObjective: true,
        includeEntity: true,
      }),
      integratedObjective: undefined,
    }));
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationOperationalObjectivesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['operationalObjective.'],
      },
      {
        field: 'integrated_objective_id',
        values: [query.integrated_objective_id],
        operation: 'equal',
        alias: ['operationalObjective.'],
      },
      {
        field: 'deadline',
        ...configRangeFilterAlias({ min_value: query.min_deadline, max_value: query.max_deadline }),
        alias: ['operationalObjective.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['operationalObjective.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['operationalObjective.'] },
      name: { field: 'name', alias: ['operationalObjective.'] },
      deadline: { field: 'deadline', alias: ['operationalObjective.'] },
      updated_at: { field: 'updated_at', alias: ['operationalObjective.'] },
      created_at: { field: 'created_at', alias: ['operationalObjective.'] },
      integratedObjective: { field: 'name', alias: ['integratedObjective.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [
      operationalObjectives,
      total_results,
    ] = await this.operationalObjectivesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<OperationalObjective[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: operationalObjectives,
    };

    return apiData;
  }
}
