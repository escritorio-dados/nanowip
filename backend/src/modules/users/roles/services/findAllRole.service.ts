import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Role } from '../entities/Role';
import { FindAllLimitedRolesQuery } from '../query/findAllLimited.roles.query';
import { FindAllPaginationRolesQuery } from '../query/findAllPagination.roles.query';
import { RolesRepository } from '../repositories/roles.repository';

@Injectable()
export class FindAllRoleService {
  constructor(private rolesRepository: RolesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedRolesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['role.'],
      },
    ];

    return this.rolesRepository.findAllLimited({ organization_id, filters });
  }

  async findPagination({ organization_id, query }: IFindAll<FindAllPaginationRolesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['role.'],
      },
      {
        field: 'permissions',
        values: [query.permission],
        operation: 'array_contains',
        alias: ['role.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['role.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['role.'] },
      name: { field: 'name', alias: ['role.'] },
      updated_at: { field: 'updated_at', alias: ['role.'] },
      created_at: { field: 'created_at', alias: ['role.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [roles, total_results] = await this.rolesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<Role[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: roles,
    };

    return apiData;
  }
}
