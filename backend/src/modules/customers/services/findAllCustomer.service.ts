import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { Customer } from '../entities/Customer';
import { FindAllLimitedCustomersQuery } from '../query/findAllLimited.customers.query';
import { FindAllPaginationCustomersQuery } from '../query/findAllPaginationCustomers.query';
import { CustomersRepository } from '../repositories/customers.repository';

type IFindAllPagination = { query: FindAllPaginationCustomersQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedCustomersQuery; organization_id: string };

@Injectable()
export class FindAllCustomerService {
  constructor(private customersRepository: CustomersRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.customersRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<Customer[]>> {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [customers, total_results] = await this.customersRepository.findAllPagination({
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
      data: customers,
    };
  }

  async execute(organization_id: string): Promise<Customer[]> {
    const customers = await this.customersRepository.findAll(organization_id);

    return customers;
  }
}
