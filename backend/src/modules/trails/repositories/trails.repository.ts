import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';

import { Trail } from '../entities/Trail';

type IFindAll = { organization_id: string };
type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

type IFindAllLimited = {
  organization_id: string;
  filters?: IFilterValueAlias[];
};

const limitedTrailsLength = 100;

@Injectable()
export class TrailsRepository {
  constructor(
    @InjectRepository(Trail)
    private repository: Repository<Trail>,
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
  }: IFindAllPagination) {
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

  async findAllLimited({ filters, organization_id }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('trail')
      .select(['trail.id', 'trail.name'])
      .orderBy('trail.name', 'ASC')
      .where({ organization_id })
      .take(limitedTrailsLength);

    configFiltersQuery({
      query,
      filters,
    });

    return query.getMany();
  }

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' } });
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

  async delete(trail: Trail) {
    await this.repository.remove(trail);

    return trail;
  }

  async save(trail: Trail) {
    return this.repository.save(trail);
  }
}
