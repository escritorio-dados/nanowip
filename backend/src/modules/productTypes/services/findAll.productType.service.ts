import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { ProductType } from '../entities/ProductType';
import { FindAllLimitedProductTypesQuery } from '../query/findAllLimited.productTypes.query';
import { FindAllPaginationProductTypesQuery } from '../query/findAllPagination.productTypes.query';
import { ProductTypesRepository } from '../repositories/productTypes.repository';

type IFindAllProductTypeService = { organization_id: string };

type IFindAllPagination = { query: FindAllPaginationProductTypesQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedProductTypesQuery; organization_id: string };

@Injectable()
export class FindAllProductTypeService {
  constructor(private productTypesRepository: ProductTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.productTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<ProductType[]>> {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [portfolios, total_results] = await this.productTypesRepository.findAllPagination({
      organization_id,
      page,
      sort_by,
      order_by,
      filters,
    });

    return {
      pagination: {
        page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: portfolios,
    };
  }

  async execute({ organization_id }: IFindAllProductTypeService) {
    const productTypes = await this.productTypesRepository.findAll(organization_id);

    return productTypes;
  }
}
