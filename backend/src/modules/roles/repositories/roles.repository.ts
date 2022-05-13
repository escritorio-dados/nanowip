import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { Role } from '../entities/Role';

type IFindAll = { organization_id: string };
type IFindByName = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: keyof Role;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type ICreateRole = { name: string; permissions: string[]; organization_id: string };

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
  }: IFindAllPagination) {
    return this.repository.findAndCount({
      where: { organization_id, ...configFiltersRepository(filters) },
      select: ['id', 'name'],
      order: { [sort_by]: order_by },
      take: paginationSizeLarge,
      skip: (page - 1) * paginationSizeLarge,
    });
  }

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' } });
  }

  async findList({ organization_id }: IFindAll) {
    return this.repository.find({
      where: { organization_id },
      order: { name: 'ASC' },
      select: ['id', 'name', 'permissions'],
    });
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
