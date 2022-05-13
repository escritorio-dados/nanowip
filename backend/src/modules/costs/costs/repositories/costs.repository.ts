import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';

import { ICreateCostRepositoryDto } from '../dtos/create.cost.repository.dto';
import { Cost } from '../entities/Cost';

type ICostSum = Cost & { percent_total: number };

type IFindByIdProps = { id: string; relations?: string[] };

type IFindAllPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

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
  }: IFindAllPagination) {
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
  }: IFindAllPagination) {
    const others = ['serviceProvider', 'documentType', 'product', 'service'];

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
      .leftJoin('costsDistributions.service', 'service')
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

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { reason: 'ASC' },
    });
  }

  async create(data: ICreateCostRepositoryDto) {
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
