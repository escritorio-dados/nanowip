import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { Organization } from '../entities/Organization';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string };
type ICreateOrganization = { name: string };

type IFindAllPagination = {
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private repository: Repository<Organization>,
  ) {}

  async findById({ id, relations }: IFindByIdProps): Promise<Organization | undefined> {
    return this.repository.findOne(id, { relations });
  }

  async findAll(): Promise<Organization[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async findAllPagination({ sort_by, order_by, page, filters }: IFindAllPagination) {
    return this.repository.findAndCount({
      where: { ...configFiltersRepository(filters) },
      select: ['id', 'name'],
      order: { [sort_by]: order_by },
      take: paginationSizeLarge,
      skip: (page - 1) * paginationSizeLarge,
    });
  }

  async findByName({ name }: IFindByName): Promise<Organization | undefined> {
    return this.repository
      .createQueryBuilder('c')
      .where('lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async create(data: ICreateOrganization): Promise<Organization> {
    const organization = this.repository.create(data);

    await this.repository.save(organization);

    return organization;
  }

  async delete(organization: Organization): Promise<Organization> {
    await this.repository.remove(organization);

    return organization;
  }

  async save(organization: Organization): Promise<Organization> {
    return this.repository.save(organization);
  }
}
