import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Portfolio } from '../entities/Portfolio';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };
type IFindAllByIds = { ids: string[]; organization_id: string };

const limitedPortfoliosLength = 100;

@Injectable()
export class PortfoliosRepository {
  constructor(
    @InjectRepository(Portfolio)
    private repository: Repository<Portfolio>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findByIdWithProjects(id: string) {
    return this.repository
      .createQueryBuilder('pf')
      .where({ id })
      .leftJoin('pf.projects', 'p')
      .select(['pf', 'p.id', 'p.name'])
      .getOne();
  }

  async findAllLimited({ filters, organization_id, customFilters }: IFindLimited) {
    const query = this.repository
      .createQueryBuilder('portfolio')
      .select(['portfolio.id', 'portfolio.name'])
      .orderBy('portfolio.name', 'ASC')
      .where({ organization_id })
      .take(limitedPortfoliosLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
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
  }: IFindPagination) {
    const query = this.repository
      .createQueryBuilder('portfolio')
      .where({ organization_id })
      .select(['portfolio.id', 'portfolio.name'])
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

  async findAllByIds({ ids, organization_id }: IFindAllByIds) {
    return this.repository.find({
      order: { name: 'ASC' },
      where: { id: In(ids), organization_id },
    });
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository.findOne({
      where: { name: Raw(alias => `${alias} ilike '${name}'`), organization_id },
    });
  }

  async create({ name, organization_id }: ICreate) {
    const portfolio = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(portfolio);

    return portfolio;
  }

  async delete(portfolio: Portfolio) {
    await this.repository.remove(portfolio);
  }

  async save(portfolio: Portfolio) {
    return this.repository.save(portfolio);
  }
}
