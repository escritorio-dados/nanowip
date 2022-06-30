import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { IntegratedObjective } from '../entities/IntegratedObjective';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateIntegratedObjective = { name: string; organization_id: string; deadline?: Date };

const limitedIntegratedObjectivesLength = 100;

@Injectable()
export class IntegratedObjectivesRepository {
  constructor(
    @InjectRepository(IntegratedObjective)
    private repository: Repository<IntegratedObjective>,
  ) {}

  async findById({ id, relations }: IFindByIdProps) {
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
      .createQueryBuilder('integratedObjective')
      .where({ organization_id })
      .select(['integratedObjective.id', 'integratedObjective.name'])
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
      .createQueryBuilder('integratedObjective')
      .select(['integratedObjective.id', 'integratedObjective.name'])
      .orderBy('integratedObjective.name', 'ASC')
      .where({ organization_id })
      .take(limitedIntegratedObjectivesLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository.findOne({
      where: { name: Raw(alias => `${alias} ilike '${name}'`), organization_id },
    });
  }

  async create(data: ICreateIntegratedObjective) {
    const integratedObjective = this.repository.create(data);

    await this.repository.save(integratedObjective);

    return integratedObjective;
  }

  async delete(integratedObjective: IntegratedObjective) {
    await this.repository.remove(integratedObjective);
  }

  async save(integratedObjective: IntegratedObjective) {
    return this.repository.save(integratedObjective);
  }
}
