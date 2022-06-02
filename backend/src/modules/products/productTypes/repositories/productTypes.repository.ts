import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { ProductType } from '../entities/ProductType';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

const limitedProductTypesLength = 100;

@Injectable()
export class ProductTypesRepository {
  constructor(
    @InjectRepository(ProductType)
    private repository: Repository<ProductType>,
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
    customFilters,
  }: IFindPagination) {
    const query = this.repository
      .createQueryBuilder('productType')
      .where({ organization_id })
      .select(['productType.id', 'productType.name'])
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
      .createQueryBuilder('productType')
      .select(['productType.id', 'productType.name'])
      .orderBy('productType.name', 'ASC')
      .where({ organization_id })
      .take(limitedProductTypesLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository
      .createQueryBuilder('c')
      .where('c.organization_id = :organization_id', { organization_id })
      .andWhere('Lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async create({ name, organization_id }: ICreate) {
    const productType = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(productType);

    return productType;
  }

  async delete(productType: ProductType) {
    await this.repository.remove(productType);
  }

  async save(productType: ProductType) {
    return this.repository.save(productType);
  }
}
