import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { Measure } from '../entities/Measure';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig };

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

  async findAll(organization_id: string) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' } });
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

  async findAllLimited({ filters, organization_id }: IFindAllLimited) {
    return this.repository.find({
      where: { organization_id, ...configFiltersRepository(filters) },
      select: ['id', 'name'],
      order: { name: 'ASC' },
      take: limitedMeasuresLength,
    });
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
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

    return measure;
  }

  async save(measure: Measure) {
    return this.repository.save(measure);
  }
}
