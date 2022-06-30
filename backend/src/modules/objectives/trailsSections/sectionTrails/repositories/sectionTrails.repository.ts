import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { SectionTrail } from '../entities/SectionTrail';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

const limitedSectionTrailsLength = 100;

@Injectable()
export class SectionTrailsRepository {
  constructor(
    @InjectRepository(SectionTrail)
    private repository: Repository<SectionTrail>,
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

    const fields = [...fieldsEntity.map(field => `sectionTrail.${field}`)];

    const query = this.repository
      .createQueryBuilder('sectionTrail')
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
      .createQueryBuilder('sectionTrail')
      .select(['sectionTrail.id', 'sectionTrail.name'])
      .orderBy('sectionTrail.name', 'ASC')
      .where({ organization_id })
      .take(limitedSectionTrailsLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository.findOne({
      where: {
        name: Raw(alias => `${alias} ilike '${name}'`),
        organization_id,
      },
    });
  }

  async create({ name, organization_id }: ICreate) {
    const sectionTrail = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(sectionTrail);

    return sectionTrail;
  }

  async delete(sectionTrail: SectionTrail) {
    await this.repository.remove(sectionTrail);
  }

  async save(sectionTrail: SectionTrail) {
    return this.repository.save(sectionTrail);
  }
}
