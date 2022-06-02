import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Organization } from '../entities/Organization';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string };
type ICreateOrganization = { name: string };

type IFindAllPagination = Omit<IFindPagination, 'organization_id'>;

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private repository: Repository<Organization>,
  ) {}

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async findAll() {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async findAllPagination({ sort_by, order_by, page, filters, customFilters }: IFindAllPagination) {
    const query = this.repository
      .createQueryBuilder('organization')
      .select(['organization.id', 'organization.name'])
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

  async findByName({ name }: IFindByName) {
    return this.repository
      .createQueryBuilder('c')
      .where('lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async create(data: ICreateOrganization) {
    const organization = this.repository.create(data);

    await this.repository.save(organization);

    return organization;
  }

  async delete(organization: Organization) {
    await this.repository.remove(organization);
  }

  async save(organization: Organization) {
    return this.repository.save(organization);
  }
}
