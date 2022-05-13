import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { ICustomFilters, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Link } from '../entities/Link';
import { FindAllPaginationLinkQuery } from '../query/findAllPagination.link.query';
import { LinksRepository } from '../repositories/links.repository';

type IFindAllPagination = {
  query: FindAllPaginationLinkQuery;
  organization_id: string;
};

@Injectable()
export class FindAllLinkService {
  constructor(private linksRepository: LinksRepository) {}

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'title',
        values: [query.title],
        operation: 'like',
        alias: ['link.'],
      },
      {
        field: 'description',
        values: [query.description],
        operation: 'like',
        alias: ['link.'],
      },
      {
        field: 'owner',
        values: [query.owner],
        operation: 'like',
        alias: ['link.'],
      },
      {
        field: 'category',
        values: [query.category],
        operation: 'like',
        alias: ['link.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['link.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['link.'] },
      title: { field: 'title', alias: ['link.'] },
      category: { field: 'category', alias: ['link.'] },
      owner: { field: 'owner', alias: ['link.'] },
      updated_at: { field: 'updated_at', alias: ['link.'] },
      created_at: { field: 'created_at', alias: ['link.'] },
    };

    const sort = sortConfig[query.sort_by];

    const customFilters: ICustomFilters = [];

    switch (query.state) {
      case 'active': {
        customFilters.push('link.active = true');
        break;
      }
      case 'disabled': {
        customFilters.push('link.active = false');
        break;
      }
      default:
        break;
    }

    const [links, total_results] = await this.linksRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters,
    });

    const dataFormmated = links.map(collaboratorStatus => ({
      ...collaboratorStatus,
      created_at: undefined,
      updated_at: undefined,
      owner: undefined,
      description: undefined,
      organization_id: undefined,
    }));

    const apiDate: IResponsePagination<Link[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: dataFormmated,
    };

    return apiDate;
  }

  async execute(organization_id: string) {
    const links = await this.linksRepository.findAll(organization_id);

    return links;
  }
}
