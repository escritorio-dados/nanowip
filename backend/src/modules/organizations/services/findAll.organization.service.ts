import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Organization } from '../entities/Organization';
import { FindAllPaginationOrganizationsQuery } from '../query/findAllPagination.organizations.query';
import { OrganizationsRepository } from '../repositories/organizations.repository';

type IFindAllPagination = { query: FindAllPaginationOrganizationsQuery };

@Injectable()
export class FindAllOrganizationService {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async findAllPagination({ query }: IFindAllPagination) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['organization.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['organization.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['organization.'] },
      name: { field: 'name', alias: ['organization.'] },
      updated_at: { field: 'updated_at', alias: ['organization.'] },
      created_at: { field: 'created_at', alias: ['organization.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [organizations, total_results] = await this.organizationsRepository.findAllPagination({
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<Organization[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: organizations,
    };

    return apiData;
  }

  async findPublic() {
    const organizations = await this.organizationsRepository.findAll();

    return organizations.map(({ id, name }) => ({ id, name }));
  }
}
