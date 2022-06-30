import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';
import { getPathQueryObjectives } from '@shared/utils/getParentPathObjectives';

import { IntegratedObjective } from '@modules/objectives/integratedObjectives/entities/IntegratedObjective';

import { OperationalObjective } from '../entities/OperationalObjective';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string; integrated_objective_id: string };
type ICreateOperationalObjective = {
  name: string;
  organization_id: string;
  deadline?: Date;
  integratedObjective: IntegratedObjective;
};

const limitedOperationalObjectivesLength = 100;

@Injectable()
export class OperationalObjectivesRepository {
  constructor(
    @InjectRepository(OperationalObjective)
    private repository: Repository<OperationalObjective>,
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
      .createQueryBuilder('operationalObjective')
      .where({ organization_id })
      .select([
        'operationalObjective.id',
        'operationalObjective.name',
        'operationalObjective.deadline',
      ])
      .take(paginationSizeLarge)
      .skip((page - 1) * paginationSizeLarge);

    getPathQueryObjectives({
      entityType: 'operationalObjective',
      query,
    });

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
      .createQueryBuilder('operationalObjective')
      .select(['operationalObjective.id', 'operationalObjective.name'])
      .orderBy('operationalObjective.name', 'ASC')
      .where({ organization_id })
      .take(limitedOperationalObjectivesLength);

    getPathQueryObjectives({
      entityType: 'operationalObjective',
      query,
    });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findByName({ name, organization_id, integrated_objective_id }: IFindByName) {
    return this.repository.findOne({
      where: {
        name: Raw(alias => `${alias} ilike '${name}'`),
        organization_id,
        integrated_objective_id,
      },
    });
  }

  async create(data: ICreateOperationalObjective) {
    const operationalObjective = this.repository.create(data);

    await this.repository.save(operationalObjective);

    return operationalObjective;
  }

  async delete(operationalObjective: OperationalObjective) {
    await this.repository.remove(operationalObjective);
  }

  async save(operationalObjective: OperationalObjective) {
    return this.repository.save(operationalObjective);
  }
}
