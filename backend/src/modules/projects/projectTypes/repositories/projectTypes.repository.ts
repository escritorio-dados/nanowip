import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { ProjectType } from '../entities/ProjectType';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

const limitedProjectTypesLength = 100;

@Injectable()
export class ProjectTypesRepository {
  constructor(
    @InjectRepository(ProjectType)
    private repository: Repository<ProjectType>,
  ) {}

  async findAll(organization_id: string) {
    return this.repository.find({
      where: { organization_id },
      order: { name: 'ASC' },
    });
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
      .createQueryBuilder('projectType')
      .where({ organization_id })
      .select(['projectType.id', 'projectType.name'])
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
      .createQueryBuilder('projectType')
      .select(['projectType.id', 'projectType.name'])
      .orderBy('projectType.name', 'ASC')
      .where({ organization_id })
      .take(limitedProjectTypesLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository.findOne({
      where: { name: Raw(alias => `${alias} ilike '${name}'`), organization_id },
    });
  }

  async create({ name, organization_id }: ICreate) {
    const projectType = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(projectType);

    return projectType;
  }

  async delete(projectType: ProjectType) {
    await this.repository.remove(projectType);
  }

  async save(projectType: ProjectType) {
    return this.repository.save(projectType);
  }
}
