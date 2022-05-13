import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindManyOptions, In, Not } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { ICreateProductRepositoryDto } from '../dtos/create.product.repository.dto';
import { IFindAllProductDto } from '../dtos/findAll.product.dto';
import { IFindByNameProductDto } from '../dtos/findByName.product.dto';
import { Product } from '../entities/Product';

type IFindAll = {
  onlyRoot?: boolean;
  onlySub?: boolean;
  relations?: string[];
  organization_id: string;
};

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
  filters?: IFilterValueAlias[];
  onlyRoot?: boolean;
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

  async findAllLimited({ filters, organization_id, onlyRoot }: IFindAllLimited) {
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

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
  }

  async findAllByParent(product_parent_id: string) {
    return this.repository.find({
      where: { product_parent_id },
      order: { name: 'ASC' },
    });
  }

  async findAllByProject(project_id: string) {
    return this.repository.find({ order: { name: 'ASC' }, where: { project_id } });
  }

  async findAllByManyProject(projects_id: string[]) {
    return this.repository.find({ order: { name: 'ASC' }, where: { project_id: In(projects_id) } });
  }

  async findAllByProductParent(product_parent_id: string) {
    return this.repository.find({ order: { name: 'ASC' }, where: { product_parent_id } });
  }

  async findAllByManyProductParent(product_parents_id: string[]) {
    return this.repository.find({
      order: { name: 'ASC' },
      where: { product_parent_id: In(product_parents_id) },
    });
  }

  async findAllByProductType(product_type_id: string, options?: IFindAllProductDto) {
    const config: FindManyOptions<Product> = {
      where: { product_type_id },
      order: { name: 'ASC' },
    };

    if (options?.onlyRoot) {
      Object.assign(config.where, {
        product_parent_id: IsNull(),
      });
    }

    return this.repository.find(config);
  }

  async findAllByMeasure(measure_id: string, options?: IFindAllProductDto) {
    const config: FindManyOptions<Product> = {
      where: { measure_id },
      order: { name: 'ASC' },
    };

    if (options?.onlyRoot) {
      Object.assign(config.where, {
        product_parent_id: IsNull(),
      });
    }

    return this.repository.find(config);
  }

  async findByName({ name, project_id, product_parent_id }: IFindByNameProductDto) {
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

  async create(data: ICreateProductRepositoryDto) {
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
