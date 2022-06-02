import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Link } from '../entities/Link';
import { ICreateLinkRepository } from './types';

type IFindByIdProps = { id: string };

@Injectable()
export class LinksRepository {
  constructor(
    @InjectRepository(Link)
    private repository: Repository<Link>,
  ) {}

  async findById({ id }: IFindByIdProps) {
    return this.repository.findOne(id);
  }

  async findAll(organization_id: string) {
    return this.repository.find({ where: { organization_id }, order: { title: 'ASC' } });
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
      .createQueryBuilder('link')
      .where({ organization_id })
      .select(['link'])
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

  async create(data: ICreateLinkRepository) {
    const link = this.repository.create(data);

    await this.repository.save(link);

    return link;
  }

  async delete(link: Link) {
    await this.repository.remove(link);
  }

  async save(link: Link) {
    return this.repository.save(link);
  }
}
