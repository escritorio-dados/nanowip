import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { ValueChain } from '../entities/ValueChain';
import { FindAllLimitedValueChainsQuery } from '../query/findAllLimited.valueChains.query';
import { FindAllPaginationValueChainsQuery } from '../query/findAllPagination.valueChains.query';
import { ValueChainsRepository } from '../repositories/valueChains.repository';

type IFindAllValueChainService = {
  organization_id: string;
  relations?: string[];

  product_id?: string;
  products_id?: string[];
  value_chain_id?: string;
};

type IFindAllPagination = { query: FindAllPaginationValueChainsQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedValueChainsQuery; organization_id: string };

@Injectable()
export class FindAllValueChainService {
  constructor(private valueChainsRepository: ValueChainsRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['valueChain.', 'product.', 'productParent.'],
      },
    ];

    const product_id = await this.valueChainsRepository.findProductId(query.value_chain_id);

    const valueChains = await this.valueChainsRepository.findAllLimited({
      organization_id,
      filters,
      product_id,
    });

    return valueChains.map(task => {
      const pathString = getParentPathString({
        entity: task,
        getProduct: true,
        entityType: 'valueChain',
      });

      const path = pathString.split(' | ');

      const newPath = path.slice(0, path.length - 1).join(' | ');

      return {
        ...task,
        pathString: newPath,
        product: undefined,
      };
    });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<ValueChain[]>> {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['valueChain.'],
      },
      {
        field: 'product_id',
        values: [query.product_id],
        operation: 'equal',
        alias: ['valueChain.'],
      },
      {
        field: 'available_date',
        ...configRangeFilterAlias({
          min_value: query.min_available,
          max_value: query.max_available,
        }),
        alias: ['valueChain.'],
      },
      {
        field: 'start_date',
        ...configRangeFilterAlias({ min_value: query.min_start, max_value: query.max_start }),
        alias: ['valueChain.'],
      },
      {
        field: 'end_date',
        ...configRangeFilterAlias({ min_value: query.min_end, max_value: query.max_end }),
        alias: ['valueChain.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['valueChain.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['valueChain.'] },
      name: { field: 'name', alias: ['valueChain.'] },
      available_date: { field: 'availableDate', alias: ['valueChain.'] },
      start_date: { field: 'startDate', alias: ['valueChain.'] },
      end_date: { field: 'endDate', alias: ['valueChain.'] },
      updated_at: { field: 'updated_at', alias: ['valueChain.'] },
      created_at: { field: 'created_at', alias: ['valueChain.'] },
      product: { field: 'name', alias: ['product.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [valueChains, total_results] = await this.valueChainsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters: [
        configStatusDatesFilters({
          statusDate: query.status_date,
          entitiesAlias: ['valueChain.'],
        }),
      ],
    });

    const valueChainsFormatted = valueChains.map(valueChain => ({
      ...valueChain,
      statusDate: getStatusDate(valueChain),
      pathString: getParentPathString({
        entity: valueChain,
        getCustomer: true,
        entityType: 'valueChain',
        skipFirstName: true,
      }),
      path: getParentPath({
        entity: valueChain,
        getCustomer: true,
        entityType: 'valueChain',
      }),
      startDate: undefined,
      endDate: undefined,
      availableDate: undefined,
      created_at: undefined,
      updated_at: undefined,
      product: undefined,
    }));

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: valueChainsFormatted,
    };
  }

  async execute({
    organization_id,
    product_id,
    products_id,
    relations,
    value_chain_id,
  }: IFindAllValueChainService): Promise<ValueChain[]> {
    // Pegandos todas as cadeias de valor de um produto
    if (product_id) {
      const valueChains = await this.valueChainsRepository.findAllByProduct({
        product_id,
        organization_id,
      });

      return valueChains;
    }

    // Pegando todas as cadeias de valores de varios produtos
    if (products_id) {
      const valueChains = await this.valueChainsRepository.findAllByManyProduct(products_id);

      if (valueChains.length > 0) {
        validateOrganization({ entity: valueChains[0], organization_id });
      }

      return valueChains;
    }

    // Pegando todas as cadeias de valor dependentes de uma cadeia de valor especifica
    if (value_chain_id) {
      const valueChains = await this.valueChainsRepository.findAllValueChainsDependents(
        value_chain_id,
        relations,
      );

      if (valueChains.length > 0) {
        validateOrganization({ entity: valueChains[0], organization_id });
      }

      return valueChains;
    }

    // Pegando todas as cadeias de valor de uma instituição
    return this.valueChainsRepository.findAll({ organization_id });
  }
}
