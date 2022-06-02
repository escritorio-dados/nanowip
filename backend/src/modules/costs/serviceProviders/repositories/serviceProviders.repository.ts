import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { ServiceProvider } from '../entities/ServiceProvider';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateServiceProvider = { name: string; organization_id: string };

const limitedServiceProvidersLength = 100;

@Injectable()
export class ServiceProvidersRepository {
  constructor(
    @InjectRepository(ServiceProvider)
    private repository: Repository<ServiceProvider>,
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
    const query = this.repository
      .createQueryBuilder('serviceProvider')
      .where({ organization_id })
      .select(['serviceProvider.id', 'serviceProvider.name'])
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
      .createQueryBuilder('serviceProvider')
      .select(['serviceProvider.id', 'serviceProvider.name'])
      .orderBy('serviceProvider.name', 'ASC')
      .where({ organization_id })
      .take(limitedServiceProvidersLength);

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

  async create(data: ICreateServiceProvider) {
    const serviceProvider = this.repository.create(data);

    await this.repository.save(serviceProvider);

    return serviceProvider;
  }

  async delete(serviceProvider: ServiceProvider) {
    await this.repository.remove(serviceProvider);
  }

  async save(serviceProvider: ServiceProvider) {
    return this.repository.save(serviceProvider);
  }
}
