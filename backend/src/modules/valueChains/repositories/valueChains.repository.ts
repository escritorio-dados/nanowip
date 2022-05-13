import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, Between, In, Brackets } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { ICreateValueChainRepository } from '../dtos/create.valueChain.repository.dto';
import { IFindAllBetweenValueChainDto } from '../dtos/findAllBetween.valueChain.dto';
import { ValueChain } from '../entities/ValueChain';

type IFindByName = { name: string; product_id: string };
type IFindAll = { organization_id: string; relations?: string[] };
type IFindAllByProduct = { organization_id: string; product_id: string; relations?: string[] };

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
  product_id: string;
  filters?: IFilterValueAlias[];
};

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

  async findProductId(value_chain_id: string) {
    const query = this.repository
      .createQueryBuilder('valueChain')
      .leftJoin('valueChain.product', 'product')
      .leftJoin('product.productParent', 'productParent')
      .where('valueChain.id = :value_chain_id', { value_chain_id })
      .select(['product.id', 'productParent.id']);

    const response = await query.getRawOne<{ product_id: string; productParent_id: string }>();

    return response.productParent_id || response.product_id;
  }

  async findAllLimited({ filters, organization_id, product_id }: IFindAllLimited) {
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
  }: IFindAllPagination) {
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

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
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

  async findAllByManyProduct(products_id: string[]) {
    return this.repository.find({ order: { name: 'ASC' }, where: { product_id: In(products_id) } });
  }

  async findAllValueChainsBetween({ min, product_id, max }: IFindAllBetweenValueChainDto) {
    if (max) {
      return this.repository.find({
        order: { name: 'ASC' },
        where: { position: Between(min, max), product_id },
      });
    }

    return this.repository.find({
      order: { name: 'ASC' },
      where: { position: MoreThan(min), product_id },
    });
  }

  async findAllValueChainsDependents(value_chain_id: string, relations?: string[]) {
    return this.repository.find({
      order: { name: 'ASC' },
      where: { value_chain_before_id: value_chain_id },
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

    return task;
  }

  async save(task: ValueChain) {
    return this.repository.save(task);
  }

  async saveAll(tasks: ValueChain[]) {
    return this.repository.save(tasks);
  }
}
