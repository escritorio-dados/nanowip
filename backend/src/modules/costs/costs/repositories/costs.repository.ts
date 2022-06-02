import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindPagination, paginationSize } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Cost } from '../entities/Cost';
import { ICreateCostRepository } from './types';

type IFindByIdProps = { id: string; relations?: string[] };

@Injectable()
export class CostsRepository {
  constructor(
    @InjectRepository(Cost)
    private repository: Repository<Cost>,
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
    const others = ['serviceProvider', 'documentType'];

    const fields = [
      'cost',
      ...others.map(entity => `${entity}.id`),
      ...others.map(entity => `${entity}.name`),
    ];

    const query = this.repository
      .createQueryBuilder('cost')
      .leftJoin('cost.serviceProvider', 'serviceProvider')
      .leftJoin('cost.documentType', 'documentType')
      .where({ organization_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAllPaginationDistribution({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
    const others = ['serviceProvider', 'documentType', 'product', 'taskType'];

    const fields = [
      'cost',
      ...others.map(entity => `${entity}.id`),
      ...others.map(entity => `${entity}.name`),
    ];

    const query = this.repository
      .createQueryBuilder('cost')
      .leftJoin('cost.serviceProvider', 'serviceProvider')
      .leftJoin('cost.documentType', 'documentType')
      .leftJoin('cost.costsDistributions', 'costsDistributions')
      .leftJoin('costsDistributions.product', 'product')
      .leftJoin('costsDistributions.taskType', 'taskType')
      .where({ organization_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAll(organization_id: string, relations?: string[]) {
    return this.repository.find({
      where: { organization_id },
      order: { reason: 'ASC' },
      relations,
    });
  }

  async create(data: ICreateCostRepository) {
    const cost = this.repository.create(data);

    await this.repository.save(cost);

    return cost;
  }

  async delete(cost: Cost) {
    await this.repository.remove(cost);
  }

  async save(cost: Cost) {
    return this.repository.save(cost);
  }

  async saveAll(costs: Cost[]) {
    return this.repository.save(costs);
  }
}
