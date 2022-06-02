import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindManyOptions, Not } from 'typeorm';

import {
  IFindLimited,
  IFindPagination,
  paginationSize,
  paginationSizeSmall,
} from '@shared/types/pagination';
import {
  configFiltersQuery,
  configFiltersQueryOr,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { Product } from '../entities/Product';
import { ICreateProductRepository, IFindByNameProductRepository } from './types';

type IFindAll = {
  onlyRoot?: boolean;
  onlySub?: boolean;
  relations?: string[];
  organization_id: string;
};

type IFindAllLimited = IFindLimited & { onlyRoot?: boolean };

type IFindTabelaFluxos = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters[];
};

const limitedProductsLength = 100;

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findByIdInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('product')
      .leftJoin('product.productType', 'productType')
      .leftJoin('product.measure', 'measure')
      .where({ id })
      .select(['product', 'productType.id', 'productType.name', 'measure.id', 'measure.name']);

    getParentPathQuery({ entityType: 'product', query, getCustomer: true });

    return query.getOne();
  }

  async findAllLimited({ filters, organization_id, onlyRoot, customFilters }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('product')
      .select(['product.id', 'product.name'])
      .orderBy('product.name', 'ASC')
      .where({ organization_id })
      .take(limitedProductsLength);

    if (onlyRoot) {
      query.andWhere({ product_parent_id: IsNull() });
    }

    getParentPathQuery({ entityType: 'product', query, getCustomer: true });

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
      'deadline',
      'availableDate',
      'startDate',
      'endDate',
      'quantity',
      'updated_at',
      'created_at',
    ];

    const others = ['measure', 'productType', 'subproductsProductType', 'subproductsMeasure'];

    const fields = [
      ...fieldsEntity.map(field => `product.${field}`),
      ...fieldsEntity.map(field => `subproducts.${field}`),
      ...others.map(entity => `${entity}.id`),
      ...others.map(entity => `${entity}.name`),
    ];

    const query = this.repository
      .createQueryBuilder('product')
      .leftJoin('product.productType', 'productType')
      .leftJoin('product.measure', 'measure')
      .leftJoin('product.subproducts', 'subproducts')
      .leftJoin('subproducts.productType', 'subproductsProductType')
      .leftJoin('subproducts.measure', 'subproductsMeasure')
      .where({
        organization_id,
        product_parent_id: IsNull(),
      })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'product', query, getCustomer: true });

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findTabelaFluxos({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindTabelaFluxos) {
    const fieldsEntity = [
      'id',
      'name',
      'deadline',
      'availableDate',
      'startDate',
      'endDate',
      'quantity',
      'updated_at',
      'created_at',
    ];

    const selectIdName = ['id', 'name'];
    const selectTasks = ['id', 'name', 'deadline', 'startDate', 'endDate', 'availableDate'];

    const selectDependencies = ['id', 'value_chain_id'];

    const select = [
      ...fieldsEntity.map(field => `product.${field}`),
      ...fieldsEntity.map(field => `subproducts.${field}`),
      ...selectIdName.map(field => `valueChains.${field}`),
      ...selectIdName.map(field => `subproductsValueChains.${field}`),
      ...selectTasks.map(field => `subTasks.${field}`),
      ...selectIdName.map(field => `subColaborator.${field}`),
      'subAssignments.id',
      ...selectDependencies.map(field => `subNextTasks.${field}`),
      ...selectDependencies.map(field => `subPreviousTasks.${field}`),
      ...selectTasks.map(field => `tasks.${field}`),
      ...selectIdName.map(field => `collaborator.${field}`),
      'assignments.id',
      ...selectDependencies.map(field => `nextTasks.${field}`),
      ...selectDependencies.map(field => `previousTasks.${field}`),
      'commentsReport.id',
      'commentsReport.reportName',
      'subCommentsReport.id',
      'subCommentsReport.reportName',
    ];

    const query = this.repository
      .createQueryBuilder('product')
      .leftJoin('product.subproducts', 'subproducts')
      .leftJoin('product.valueChains', 'valueChains')
      .leftJoin('subproducts.valueChains', 'subproductsValueChains')
      .leftJoin('subproductsValueChains.tasks', 'subTasks')
      .leftJoin('subTasks.assignments', 'subAssignments')
      .leftJoin('subAssignments.collaborator', 'subColaborator')
      .leftJoin('subTasks.nextTasks', 'subNextTasks')
      .leftJoin('subTasks.previousTasks', 'subPreviousTasks')
      .leftJoin('valueChains.tasks', 'tasks')
      .leftJoin('tasks.assignments', 'assignments')
      .leftJoin('assignments.collaborator', 'collaborator')
      .leftJoin('tasks.nextTasks', 'nextTasks')
      .leftJoin('tasks.previousTasks', 'previousTasks')
      .leftJoin('tasks.commentsReport', 'commentsReport')
      .leftJoin('subTasks.commentsReport', 'subCommentsReport')
      .select(select)
      .where({ organization_id, product_parent_id: IsNull() })
      .take(paginationSizeSmall)
      .skip((page - 1) * paginationSizeSmall);

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQueryOr({
      query,
      filters,
      customFilters,
    });

    getParentPathQuery({ entityType: 'product', query, getCustomer: true });

    return query.getManyAndCount();
  }

  async findAll({ organization_id, onlyRoot, onlySub, relations }: IFindAll) {
    const config: FindManyOptions<Product> = {
      order: { name: 'ASC' },
      where: { organization_id },
      relations,
    };

    if (onlyRoot) {
      config.where = { product_parent_id: IsNull(), organization_id };
    } else if (onlySub) {
      config.where = { product_parent_id: Not(IsNull()), organization_id };
    }

    return this.repository.find(config);
  }

  async findAllByParent(product_parent_id: string) {
    return this.repository.find({
      where: { product_parent_id },
      order: { name: 'ASC' },
    });
  }

  async findByName({ name, project_id, product_parent_id }: IFindByNameProductRepository) {
    const product = this.repository
      .createQueryBuilder('c')
      .where('Lower(c.name) = :name', { name: name.toLowerCase() });

    if (product_parent_id) {
      product.andWhere('c.product_parent_id = :product_parent_id', { product_parent_id });
    } else {
      product.andWhere('c.project_id = :project_id', { project_id });
    }

    return product.getOne();
  }

  async create(data: ICreateProductRepository) {
    const product = this.repository.create(data);

    await this.repository.save(product);

    return product;
  }

  async delete(product: Product) {
    await this.repository.remove(product);
  }

  async save(product: Product) {
    return this.repository.save(product);
  }

  async saveAll(products: Product[]) {
    return this.repository.save(products);
  }
}
