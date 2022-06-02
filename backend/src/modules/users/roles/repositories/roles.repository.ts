import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Role } from '../entities/Role';

type IFindByName = { name: string; organization_id: string };

type ICreateRole = { name: string; permissions: string[]; organization_id: string };

const limitedRolesLength = 100;

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private repository: Repository<Role>,
  ) {}

  async findById(id: string) {
    return this.repository.findOne(id);
  }

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
    const query = this.repository
      .createQueryBuilder('role')
      .where({ organization_id })
      .select(['role.id', 'role.name'])
      .take(paginationSizeLarge)
      .skip((page - 1) * paginationSizeLarge);

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAllLimited({ filters, organization_id, customFilters }: IFindLimited) {
    const query = this.repository
      .createQueryBuilder('role')
      .select(['role.id', 'role.name', 'role.permissions'])
      .orderBy('role.name', 'ASC')
      .where({ organization_id })
      .take(limitedRolesLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository
      .createQueryBuilder('c')
      .where('c.organization_id = :organization_id', { organization_id })
      .andWhere('lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async create(data: ICreateRole) {
    const role = this.repository.create(data);

    await this.repository.save(role);

    return role;
  }

  async delete(role: Role) {
    await this.repository.remove(role);
  }

  async save(role: Role) {
    return this.repository.save(role);
  }
}
