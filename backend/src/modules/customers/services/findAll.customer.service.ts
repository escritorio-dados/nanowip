import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Customer } from '../entities/Customer';
import { FindAllLimitedCustomersQuery } from '../query/findAllLimited.customers.query';
import { FindAllPaginationCustomersQuery } from '../query/findAllPagination.customers.query';
import { CustomersRepository } from '../repositories/customers.repository';

@Injectable()
export class FindAllCustomerService {
  constructor(private customersRepository: CustomersRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedCustomersQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['customer.'],
      },
    ];

    return this.customersRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindAllPaginationCustomersQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['customer.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['customer.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['customer.'] },
      name: { field: 'name', alias: ['customer.'] },
      updated_at: { field: 'updated_at', alias: ['customer.'] },
      created_at: { field: 'created_at', alias: ['customer.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [customers, total_results] = await this.customersRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<Customer[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: customers,
    };

    return apiData;
  }
}
