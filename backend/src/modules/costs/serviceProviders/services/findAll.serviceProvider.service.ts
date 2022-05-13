import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { ServiceProvider } from '../entities/ServiceProvider';
import { FindAllLimitedServiceProvidersQuery } from '../query/findAllLimited.serviceProviders.query';
import { FindAllPaginationServiceProvidersQuery } from '../query/findAllPagination.serviceProviders.query';
import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';

type IFindAllPagination = {
  query: FindAllPaginationServiceProvidersQuery;
  organization_id: string;
};
type IFindAllLimited = { query: FindAllLimitedServiceProvidersQuery; organization_id: string };

@Injectable()
export class FindAllServiceProviderService {
  constructor(private serviceProvidersRepository: ServiceProvidersRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.serviceProvidersRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [
      serviceProviders,
      total_results,
    ] = await this.serviceProvidersRepository.findAllPagination({
      organization_id,
      page,
      sort_by,
      order_by,
      filters,
    });

    const apiData: IResponsePagination<ServiceProvider[]> = {
      pagination: {
        page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: serviceProviders,
    };

    return apiData;
  }
}
