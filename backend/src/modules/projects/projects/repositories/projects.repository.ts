import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, Not, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSize } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { Project } from '../entities/Project';
import {
  ICreateProjectRepository,
  IFindAllProjectRepository,
  IFindByNameProjectRepository,
} from './types';

type IFindAllLimited = IFindLimited & { onlyRoot?: boolean };

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

  async findAllLimited({ filters, organization_id, onlyRoot, customFilters }: IFindAllLimited) {
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

  async findAll({ organization_id, onlyRoot, onlySub, relations }: IFindAllProjectRepository) {
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

  async findAllByParent(project_parent_id: string) {
    return this.repository.find({
      where: { project_parent_id },
      order: { name: 'ASC' },
    });
  }

  async findByName({
    project_parent_id,
    customer_id,
    name,
    organization_id,
  }: IFindByNameProjectRepository) {
    const project = this.repository
      .createQueryBuilder('project')
      .where('project.organization_id = :organization_id', { organization_id })
      .andWhere('lower(project.name) = :name', { name: name.toLowerCase() });

    if (customer_id) {
      project.andWhere('project.customer_id = :customer_id', { customer_id });
    } else {
      project.andWhere('project.project_parent_id = :project_parent_id', { project_parent_id });
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
