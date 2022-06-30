import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { selectFields } from '@shared/utils/selectFields';

import { ValueChain } from '../entities/ValueChain';
import { valueChainErrors } from '../errors/valueChain.errors';
import { FindAllByProductValueChainsQuery } from '../query/findAllByProduct.valueChains.query';
import { FindAllLimitedValueChainsQuery } from '../query/findAllLimited.valueChains.query';
import { FindAllPaginationValueChainsQuery } from '../query/findAllPagination.valueChains.query';
import { ValueChainsRepository } from '../repositories/valueChains.repository';

@Injectable()
export class FindAllValueChainService {
  constructor(private valueChainsRepository: ValueChainsRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedValueChainsQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['valueChain.', 'product.', 'productParent.'],
      },
    ];

    const product_id = await this.valueChainsRepository.findProductId(query.value_chain_id);

    if (!product_id) {
      throw new AppError(valueChainErrors.notFound);
    }

    const valueChains = await this.valueChainsRepository.findAllLimitedProduct({
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

  async findAllByProduct({ organization_id, query }: IFindAll<FindAllByProductValueChainsQuery>) {
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
    ];

    const valueChains = await this.valueChainsRepository.findLimited({
      organization_id,
      filters,
    });

    return valueChains;
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindAllPaginationValueChainsQuery>) {
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
      ...selectFields(valueChain, ['id', 'name']),
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
    }));

    const apiData: IResponsePagination<ValueChain[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: valueChainsFormatted,
    };

    return apiData;
  }
}
