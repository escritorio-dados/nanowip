import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { Service } from '../entities/Service';
import { FindAllLimitedServicesQuery } from '../query/findAllLimited.services.query';
import { FindAllPaginationServicesQuery } from '../query/findAllPagination.services.query';
import { ServicesRepository } from '../repositories/services.repository';

type IFindAllPagination = {
  query: FindAllPaginationServicesQuery;
  organization_id: string;
};
type IFindAllLimited = { query: FindAllLimitedServicesQuery; organization_id: string };

@Injectable()
export class FindAllServiceService {
  constructor(private servicesRepository: ServicesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.servicesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [services, total_results] = await this.servicesRepository.findAllPagination({
      organization_id,
      page,
      sort_by,
      order_by,
      filters,
    });

    const apiData: IResponsePagination<Service[]> = {
      pagination: {
        page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: services,
    };

    return apiData;
  }
}
