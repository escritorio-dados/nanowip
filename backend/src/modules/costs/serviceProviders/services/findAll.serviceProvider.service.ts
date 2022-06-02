import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { ServiceProvider } from '../entities/ServiceProvider';
import { FindAllLimitedServiceProvidersQuery } from '../query/findAllLimited.serviceProviders.query';
import { FindAllPaginationServiceProvidersQuery } from '../query/findAllPagination.serviceProviders.query';
import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';

@Injectable()
export class FindAllServiceProviderService {
  constructor(private serviceProvidersRepository: ServiceProvidersRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedServiceProvidersQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['serviceProvider.'],
      },
    ];

    return this.serviceProvidersRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationServiceProvidersQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['serviceProvider.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['serviceProvider.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['serviceProvider.'] },
      name: { field: 'name', alias: ['serviceProvider.'] },
      updated_at: { field: 'updated_at', alias: ['serviceProvider.'] },
      created_at: { field: 'created_at', alias: ['serviceProvider.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [
      serviceProviders,
      total_results,
    ] = await this.serviceProvidersRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<ServiceProvider[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: serviceProviders,
    };

    return apiData;
  }
}
