import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, IsNull, Not, Repository } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { ICreateProjectRepository } from '../dtos/create.project.repository.dto';
import { IFindAllProjectDto } from '../dtos/findAll.project.dto';
import { IFindByNameProjectDto } from '../dtos/findByName.project.dto';
import { Project } from '../entities/Project';

type IFindAllProjectByType = { project_type_id: string; onlyRoot?: boolean };

type IFindAllPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

type IFindAllLimited = {
  organization_id: string;
  filters?: IFilterValueAlias[];
  onlyRoot?: boolean;
};

const limitedProjectsLength = 100;

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private repository: Repository<Project>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findByIdInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('project')
      .leftJoin('project.projectType', 'projectType')
      .leftJoin('project.portfolios', 'portfolios')
      .where({ id })
      .select([
        'project',
        'projectType.id',
        'projectType.name',
        'portfolios.id',
        'portfolios.name',
      ]);

    getParentPathQuery({ entityType: 'project', query, getCustomer: true });

    return query.getOne();
  }

  async findAllLimited({ filters, organization_id, onlyRoot }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('project')
      .select(['project.id', 'project.name'])
      .orderBy('project.name', 'ASC')
      .where({ organization_id })
      .take(limitedProjectsLength);

    if (onlyRoot) {
      query.andWhere({ project_parent_id: IsNull() });
    }

    getParentPathQuery({ entityType: 'project', query, getCustomer: true });

    configFiltersQuery({
      query,
      filters,
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
  }: IFindAllPagination) {
    const fieldsEntity = [
      'id',
      'name',
      'deadline',
      'availableDate',
      'startDate',
      'endDate',
      'updated_at',
      'created_at',
    ];

    const others = ['projectType', 'subprojectsProjectType', 'portfolios', 'subprojectsPortfolios'];

    const fields = [
      ...fieldsEntity.map(field => `project.${field}`),
      ...fieldsEntity.map(field => `subprojects.${field}`),
      ...others.map(entity => `${entity}.id`),
      ...others.map(entity => `${entity}.name`),
    ];

    const query = this.repository
      .createQueryBuilder('project')
      .leftJoin('project.projectType', 'projectType')
      .leftJoin('project.subprojects', 'subprojects')
      .leftJoin('subprojects.projectType', 'subprojectsProjectType')
      .leftJoin('project.portfolios', 'portfolios')
      .leftJoin('subprojects.portfolios', 'subprojectsPortfolios')
      .where({
        organization_id,
        project_parent_id: IsNull(),
      })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'project', query, getCustomer: true });

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAll({ organization_id, onlyRoot, onlySub, relations }: IFindAllProjectDto) {
    const config: FindManyOptions<Project> = {
      order: { name: 'ASC' },
      where: { organization_id },
      relations,
    };

    if (onlyRoot) {
      config.where = { project_parent_id: IsNull(), organization_id };
    } else if (onlySub) {
      config.where = { project_parent_id: Not(IsNull()), organization_id };
    }

    return this.repository.find(config);
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
  }

  async findAllByCustomer(customer_id: string) {
    return this.repository.find({
      where: { customer_id },
      order: { name: 'ASC' },
    });
  }

  async findAllByPortfolioIds(portfolio_ids: string[]) {
    return this.repository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.portfolios', 'portfolio')
      .where('portfolio.id IN (:...portfolio_ids)', { portfolio_ids })
      .getMany();
  }

  async findAllByPortfolio(portfolio_id: string) {
    return this.repository
      .createQueryBuilder('project')
      .leftJoin('project.portfolios', 'portfolio')
      .where('portfolio.id = :portfolio_id', { portfolio_id })
      .getMany();
  }

  async findAllByParent(project_parent_id: string) {
    return this.repository.find({
      where: { project_parent_id },
      order: { name: 'ASC' },
    });
  }

  async findAllByProjectType({ project_type_id, onlyRoot }: IFindAllProjectByType) {
    const config: FindManyOptions<Project> = {
      where: { project_type_id },
      order: { name: 'ASC' },
    };

    if (onlyRoot) {
      Object.assign(config.where, {
        project_parent_id: IsNull(),
      });
    }

    return this.repository.find(config);
  }

  async findByName({
    project_parent_id,
    customer_id,
    name,
    organization_id,
  }: IFindByNameProjectDto) {
    const project = this.repository
      .createQueryBuilder('p')
      .where('p.organization_id = :organization_id', { organization_id })
      .andWhere('lower(p.name) = :name', { name: name.toLowerCase() });

    if (customer_id) {
      project.andWhere('p.customer_id = :customer_id', { customer_id });
    } else {
      project.andWhere('p.project_parent_id = :project_parent_id', { project_parent_id });
    }

    return project.getOne();
  }

  async create(data: ICreateProjectRepository) {
    const project = this.repository.create(data);

    await this.repository.save(project);

    return project;
  }

  async delete(project: Project) {
    await this.repository.remove(project);
  }

  async save(project: Project) {
    return this.repository.save(project);
  }

  async saveAll(projects: Project[]) {
    return this.repository.save(projects);
  }
}
