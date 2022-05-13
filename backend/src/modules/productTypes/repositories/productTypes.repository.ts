import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { ProductType } from '../entities/ProductType';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig };

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
  }: IFindAllPagination) {
    return this.repository.findAndCount({
      where: { organization_id, ...configFiltersRepository(filters) },
      select: ['id', 'name'],
      order: { [sort_by]: order_by },
      take: paginationSizeLarge,
      skip: (page - 1) * paginationSizeLarge,
    });
  }

  async findAllLimited({ filters, organization_id }: IFindAllLimited) {
    return this.repository.find({
      where: { organization_id, ...configFiltersRepository(filters) },
      select: ['id', 'name'],
      order: { name: 'ASC' },
      take: limitedProductTypesLength,
    });
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
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
