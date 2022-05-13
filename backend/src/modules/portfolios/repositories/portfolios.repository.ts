import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { Portfolio } from '../entities/Portfolio';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };
type IFindAllByIds = { ids: string[] };
type IFindAll = { organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: keyof Portfolio;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig };

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

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' } });
  }

  async findAllLimited({ filters, organization_id }: IFindAllLimited) {
    return this.repository.find({
      where: { organization_id, ...configFiltersRepository(filters) },
      select: ['id', 'name'],
      order: { name: 'ASC' },
      take: limitedPortfoliosLength,
    });
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

  async findAllByIds({ ids }: IFindAllByIds) {
    return this.repository.find({
      order: { name: 'ASC' },
      where: { id: In(ids) },
    });
  }

  async findAllByProject(project_id: string) {
    return this.repository
      .createQueryBuilder('portfolio')
      .innerJoin('portfolio.projects', 'project')
      .where('project.id = :project_id', { project_id })
      .getMany();
  }

  async findAllByProjectIds(ids: string[]) {
    return this.repository
      .createQueryBuilder('portfolio')
      .innerJoinAndSelect('portfolio.projects', 'project')
      .where('project.id IN (:...ids)', { ids })
      .getMany();
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
