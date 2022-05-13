import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFilterConfig, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { User } from '../entities/User';
import { FindAllLimitedUsersQuery } from '../query/findAllLimitedUsers.query';
import { FindAllUsersQuery } from '../query/findAllUsers.query';
import { UsersRepository } from '../repositories/users.repository';
import { DEFAULT_USER_ID } from '../seeds/users.seeds';

type IFindAllPagination = { query: FindAllUsersQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedUsersQuery; organization_id: string };

@Injectable()
export class FindAllUserService {
  constructor(private usersRepository: UsersRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
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

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<User[]>> {
    const { page, sort_by, order_by, email, name, permission, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      email: email && ['like', email],
      permissions: permission && ['array_contains', permission],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [users, total_results] = await this.usersRepository.findAllPagination({
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
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: users,
    };
  }

  async execute(organization_id: string, query: FindAllUsersQuery): Promise<User[]> {
    const { free, include } = query;

    // Casos para pegar somente usuarios com colaboradores ou somente usuarios sem colaboradores
    if (free) {
      const users = await this.usersRepository.findAll(organization_id, ['collaborator']);

      return users.filter(user => !!user.collaborator !== free && user.id !== DEFAULT_USER_ID);
    }

    const users = await this.usersRepository.findAll(organization_id, include);

    return users;
  }
}
