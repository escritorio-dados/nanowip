import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { Role } from '../entities/Role';
import { ListPaginationRolesQuery } from '../query/listPaginationRoles.query';
import { RolesRepository } from '../repositories/roles.repository';

type IFindPagination = { query: ListPaginationRolesQuery; organization_id: string };

type IFindAllRole = { organization_id: string };

@Injectable()
export class FindAllRoleService {
  constructor(private rolesRepository: RolesRepository) {}

  async findList({ organization_id }: IFindAllRole): Promise<Role[]> {
    const roles = await this.rolesRepository.findList({ organization_id });

    return roles;
  }

  async findPagination({
    organization_id,
    query,
  }: IFindPagination): Promise<IResponsePagination<Role[]>> {
    const { page, sort_by, order_by, name, permission, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      permissions: permission && ['array_contains', permission],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [roles, total_results] = await this.rolesRepository.findAllPagination({
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
      data: roles,
    };
  }
}
