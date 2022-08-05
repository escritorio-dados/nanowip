import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Trail } from '../entities/Trail';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

const limitedTrailsLength = 100;

@Injectable()
export class TrailsRepository {
  constructor(
    @InjectRepository(Trail)
    private repository: Repository<Trail>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
    const fieldsEntity = ['id', 'name', 'updated_at', 'created_at'];

    const fields = [...fieldsEntity.map(field => `trail.${field}`)];

    const query = this.repository
      .createQueryBuilder('trail')
      .where({ organization_id })
      .select(fields)
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
      .createQueryBuilder('trail')
      .select(['trail.id', 'trail.name'])
      .orderBy('trail.name', 'ASC')
      .where({ organization_id })
      .take(limitedTrailsLength);

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

  async create({ name, organization_id }: ICreate) {
    const trail = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(trail);

    return trail;
  }

  async delete(trail: Trail, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Trail) : this.repository;

    await repo.remove(trail);
  }

  async save(trail: Trail) {
    return this.repository.save(trail);
  }
}
