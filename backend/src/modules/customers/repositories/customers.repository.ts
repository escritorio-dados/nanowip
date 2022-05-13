import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { Customer } from '../entities/Customer';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateCustomer = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig };

const limitedCustomersLength = 100;

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private repository: Repository<Customer>,
  ) {}

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async findByIdWithProjects(id: string) {
    return this.repository
      .createQueryBuilder('c')
      .select(['c', 'p.id', 'p.name'])
      .leftJoin('c.projects', 'p')
      .where({ id })
      .getOne();
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
      take: limitedCustomersLength,
    });
  }

  async findAll(organization_id: string) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' } });
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository.findOne({
      where: { name: Raw(alias => `${alias} ilike '${name}'`), organization_id },
    });
  }

  async create(data: ICreateCustomer) {
    const customer = this.repository.create(data);

    await this.repository.save(customer);

    return customer;
  }

  async delete(customer: Customer) {
    await this.repository.remove(customer);
  }

  async save(customer: Customer) {
    return this.repository.save(customer);
  }
}
