import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Measure } from '../entities/Measure';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

const limitedMeasuresLength = 100;

@Injectable()
export class MeasuresRepository {
  constructor(
    @InjectRepository(Measure)
    private repository: Repository<Measure>,
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
    const query = this.repository
      .createQueryBuilder('measure')
      .where({ organization_id })
      .select(['measure.id', 'measure.name'])
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
      .createQueryBuilder('measure')
      .select(['measure.id', 'measure.name'])
      .orderBy('measure.name', 'ASC')
      .where({ organization_id })
      .take(limitedMeasuresLength);

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
      .andWhere('Lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async create({ name, organization_id }: ICreate) {
    const measure = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(measure);

    return measure;
  }

  async delete(measure: Measure) {
    await this.repository.remove(measure);
  }

  async save(measure: Measure) {
    return this.repository.save(measure);
  }
}
