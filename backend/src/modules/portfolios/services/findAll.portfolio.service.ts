import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Portfolio } from '../entities/Portfolio';
import { FindAllLimitedPortfoliosQuery } from '../query/findAllLimited.portfolios.query';
import { FindAllPaginationPortifoliosQuery } from '../query/findAllPagination.portfolios.query';
import { PortfoliosRepository } from '../repositories/portfolios.repository';

type IFindAllByIds = { organization_id: string; portfolios_id: string[] };

@Injectable()
export class FindAllPortfolioService {
  constructor(private portfoliosRepository: PortfoliosRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedPortfoliosQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['portfolio.'],
      },
    ];

    return this.portfoliosRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindAllPaginationPortifoliosQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['portfolio.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['portfolio.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['portfolio.'] },
      name: { field: 'name', alias: ['portfolio.'] },
      updated_at: { field: 'updated_at', alias: ['portfolio.'] },
      created_at: { field: 'created_at', alias: ['portfolio.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [portfolios, total_results] = await this.portfoliosRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<Portfolio[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: portfolios,
    };

    return apiData;
  }

  async findAllByIds({ organization_id, portfolios_id }: IFindAllByIds) {
    // Todos os portfiolios dos ids pasados
    const portfolios = await this.portfoliosRepository.findAllByIds({
      ids: portfolios_id,
      organization_id,
    });

    return portfolios;
  }
}
