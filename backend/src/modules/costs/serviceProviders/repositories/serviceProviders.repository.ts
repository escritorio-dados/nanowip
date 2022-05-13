import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { ServiceProvider } from '../entities/ServiceProvider';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateServiceProvider = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig };

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
      take: limitedServiceProvidersLength,
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
