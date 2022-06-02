import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Measure } from '../entities/Measure';
import { FindAllLimitedMeasuresQuery } from '../query/findAllLimited.measures.query';
import { FindAllPaginationMeasuresQuery } from '../query/findAllPagination.measures.query';
import { MeasuresRepository } from '../repositories/measures.repository';

@Injectable()
export class FindAllMeasureService {
  constructor(private measuresRepository: MeasuresRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedMeasuresQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['measure.'],
      },
    ];

    return this.measuresRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindAllPaginationMeasuresQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['measure.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['measure.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['measure.'] },
      name: { field: 'name', alias: ['measure.'] },
      updated_at: { field: 'updated_at', alias: ['measure.'] },
      created_at: { field: 'created_at', alias: ['measure.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [measures, total_results] = await this.measuresRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<Measure[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: measures,
    };

    return apiData;
  }
}
