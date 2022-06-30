import { Injectable } from '@nestjs/common';

import { paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { FindAllLimitedSectionTrailsQuery } from '../query/findAllLimited.sectionTrails.query';
import { FindAllPaginationSectionTrailsQuery } from '../query/findAllPagination.sectionTrails.query';
import { SectionTrailsRepository } from '../repositories/sectionTrails.repository';

@Injectable()
export class FindAllSectionTrailService {
  constructor(private sectionTrailsRepository: SectionTrailsRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedSectionTrailsQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['sectionTrail.'],
      },
    ];

    const sectionTrails = await this.sectionTrailsRepository.findAllLimited({
      organization_id,
      filters,
    });

    return sectionTrails;
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationSectionTrailsQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['sectionTrail.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['sectionTrail.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['sectionTrail.'] },
      name: { field: 'name', alias: ['sectionTrail.'] },
      updated_at: { field: 'updated_at', alias: ['sectionTrail.'] },
      created_at: { field: 'created_at', alias: ['sectionTrail.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [sectionTrails, total_results] = await this.sectionTrailsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const sectionTrailsFormatted = sectionTrails.map(sectionTrail => ({
      ...sectionTrail,
      created_at: undefined,
      updated_at: undefined,
    }));

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: sectionTrailsFormatted,
    };
  }
}
