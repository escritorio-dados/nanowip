import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { Organization } from '../entities/Organization';
import { FindAllPaginationOrganizationsQuery } from '../query/findAllPagination.organizations.query';
import { OrganizationsRepository } from '../repositories/organizations.repository';

type IFindAllPagination = { query: FindAllPaginationOrganizationsQuery };

@Injectable()
export class FindAllOrganizationService {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async findAllPagination({ query }: IFindAllPagination) {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [customers, total_results] = await this.organizationsRepository.findAllPagination({
      page,
      sort_by,
      order_by,
      filters,
    });

    const apiData: IResponsePagination<Organization[]> = {
      pagination: {
        page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: customers,
    };

    return apiData;
  }

  async execute() {
    const organizations = await this.organizationsRepository.findAll();

    return organizations;
  }

  async findPublic() {
    const organizations = await this.organizationsRepository.findAll();

    return organizations.map(({ id, name }) => ({ id, name }));
  }
}
