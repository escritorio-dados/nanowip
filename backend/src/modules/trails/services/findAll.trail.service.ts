import { Injectable } from '@nestjs/common';

import { paginationSizeLarge } from '@shared/types/pagination';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { FindAllLimitedTrailsQuery } from '../query/findAllLimited.trails.query';
import { FindAllPaginationTrailsQuery } from '../query/findAllPagination.trails.query';
import { TrailsRepository } from '../repositories/trails.repository';

type IFindAllTrailService = { organization_id: string };

type IFindAllPagination = { query: FindAllPaginationTrailsQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedTrailsQuery; organization_id: string };

@Injectable()
export class FindAllTrailService {
  constructor(private trailsRepository: TrailsRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['trail.'],
      },
    ];

    const trails = await this.trailsRepository.findAllLimited({
      organization_id,
      filters,
    });

    return trails;
  }

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['trail.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['trail.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['trail.'] },
      name: { field: 'name', alias: ['trail.'] },
      updated_at: { field: 'updated_at', alias: ['trail.'] },
      created_at: { field: 'created_at', alias: ['trail.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [trails, total_results] = await this.trailsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const trailsFormatted = trails.map(trail => ({
      ...trail,
      created_at: undefined,
      updated_at: undefined,
    }));

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: trailsFormatted,
    };
  }

  async execute({ organization_id }: IFindAllTrailService) {
    const trails = await this.trailsRepository.findAll({ organization_id });

    return trails;
  }
}
