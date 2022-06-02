import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { ProductType } from '../entities/ProductType';
import { FindAllLimitedProductTypesQuery } from '../query/findAllLimited.productTypes.query';
import { FindAllPaginationProductTypesQuery } from '../query/findAllPagination.productTypes.query';
import { ProductTypesRepository } from '../repositories/productTypes.repository';

@Injectable()
export class FindAllProductTypeService {
  constructor(private productTypesRepository: ProductTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedProductTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['productType.'],
      },
    ];

    return this.productTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationProductTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['productType.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['productType.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['productType.'] },
      name: { field: 'name', alias: ['productType.'] },
      updated_at: { field: 'updated_at', alias: ['productType.'] },
      created_at: { field: 'created_at', alias: ['productType.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [portfolios, total_results] = await this.productTypesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<ProductType[]> = {
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
