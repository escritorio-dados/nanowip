import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Customer } from '../entities/Customer';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateCustomer = { name: string; organization_id: string };

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
      .createQueryBuilder('customer')
      .select(['customer', 'projects.id', 'projects.name'])
      .leftJoin('customer.projects', 'projects')
      .where({ id })
      .getOne();
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
      .createQueryBuilder('customer')
      .where({ organization_id })
      .select(['customer.id', 'customer.name'])
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
      .createQueryBuilder('customer')
      .select(['customer.id', 'customer.name'])
      .orderBy('customer.name', 'ASC')
      .where({ organization_id })
      .take(limitedCustomersLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
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
