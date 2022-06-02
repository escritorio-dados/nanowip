import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { User } from '../entities/User';
import { FindAllLimitedUsersQuery } from '../query/findAllLimited.users.query';
import { FindPaginationUsersQuery } from '../query/findPagination.users.query';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class FindAllUserService {
  constructor(private usersRepository: UsersRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedUsersQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'email',
        values: [query.name],
        operation: 'like',
        alias: ['user.'],
      },
    ];

    const users = await this.usersRepository.findAllLimited({
      organization_id,
      free: query.free,
      filters,
    });

    return users;
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindPaginationUsersQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['user.'],
      },
      {
        field: 'email',
        values: [query.email],
        operation: 'like',
        alias: ['user.'],
      },
      {
        field: 'permissions',
        values: [query.permission],
        operation: 'array_contains',
        alias: ['user.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['user.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['user.'] },
      name: { field: 'name', alias: ['user.'] },
      email: { field: 'email', alias: ['user.'] },
      updated_at: { field: 'updated_at', alias: ['user.'] },
      created_at: { field: 'created_at', alias: ['user.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [users, total_results] = await this.usersRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<User[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: users,
    };

    return apiData;
  }
}
