import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSize } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';
import { getFieldsQuery } from '@shared/utils/selectFields';

import { ValueChain } from '../entities/ValueChain';
import { ICreateValueChainRepository } from './types';

type IFindByName = { name: string; product_id: string };
type IFindAll = { organization_id: string; relations?: string[] };
type IFindAllByProduct = { organization_id: string; product_id: string; relations?: string[] };

type IFindAllByKeys = {
  organization_id: string;
  relations?: string[];
  key: string;
  values: string[];
};

type IFindAllLimited = IFindLimited & { product_id: string };

const limitedValueChainsLength = 100;

@Injectable()
export class ValueChainsRepository {
  constructor(
    @InjectRepository(ValueChain)
    private repository: Repository<ValueChain>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findByIdInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('valueChain')
      .where({ id })
      .select(['valueChain']);

    getParentPathQuery({ entityType: 'valueChain', query, getCustomer: true });

    return query.getOne();
  }

  async findAll({ organization_id, relations }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' }, relations });
  }

  async findAllByKeys({ organization_id, relations, key, values }: IFindAllByKeys) {
    return this.repository.find({
      where: { [key]: In(values), organization_id },
      relations,
    });
  }

  async findProductId(value_chain_id: string) {
    const query = this.repository
      .createQueryBuilder('valueChain')
      .leftJoin('valueChain.product', 'product')
      .leftJoin('product.productParent', 'productParent')
      .where('valueChain.id = :value_chain_id', { value_chain_id })
      .select(['product.id', 'productParent.id']);

    const response = await query.getRawOne<{ product_id: string; productParent_id: string }>();

    return response ? response.productParent_id || response.product_id : undefined;
  }

  async findAllLimitedProduct({
    filters,
    organization_id,
    product_id,
    customFilters,
  }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('valueChain')
      .select(['valueChain.id', 'valueChain.name'])
      .orderBy('valueChain.name', 'ASC')
      .where({ organization_id })
      .take(limitedValueChainsLength);

    getParentPathQuery({ entityType: 'valueChain', query, getCustomer: true });

    query.andWhere(
      new Brackets(q => {
        q.where('product.id = :product_id', {
          product_id,
        });

        q.orWhere('productParent.id = :product_id', { product_id });
      }),
    );

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findLimited({ filters, organization_id, customFilters }: IFindLimited) {
    const query = this.repository
      .createQueryBuilder('valueChain')
      .select(getFieldsQuery(['valueChain'], ['id', 'name']))
      .orderBy('valueChain.name', 'ASC')
      .where({ organization_id })
      .take(limitedValueChainsLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
    const fieldsEntity = [
      'id',
      'name',
      'availableDate',
      'startDate',
      'endDate',
      'updated_at',
      'created_at',
    ];

    const fields = [...fieldsEntity.map(field => `valueChain.${field}`)];

    const query = this.repository
      .createQueryBuilder('valueChain')
      .where({ organization_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'valueChain', query, getCustomer: true });

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findByIdWithTrackers(id: string) {
    return this.repository.findOne(id, {
      join: {
        alias: 'vc',
        leftJoinAndSelect: {
          tasks: 'vc.tasks',
          assignments: 'tasks.assignments',
          trackers: 'assignments.trackers',
        },
      },
    });
  }

  async findAllByProduct({ product_id, organization_id, relations }: IFindAllByProduct) {
    return this.repository.find({
      order: { name: 'ASC' },
      where: { product_id, organization_id },
      relations,
    });
  }

  async findByName({ name, product_id }: IFindByName) {
    return this.repository
      .createQueryBuilder('s')
      .where('Lower(s.name) = :name', { name: name.toLowerCase() })
      .andWhere('s.product_id = :product_id', { product_id })
      .getOne();
  }

  async create(data: ICreateValueChainRepository) {
    const task = this.repository.create(data);

    await this.repository.save(task);

    return task;
  }

  async delete(task: ValueChain) {
    await this.repository.remove(task);
  }

  async save(task: ValueChain) {
    return this.repository.save(task);
  }

  async saveAll(tasks: ValueChain[]) {
    return this.repository.save(tasks);
  }
}
