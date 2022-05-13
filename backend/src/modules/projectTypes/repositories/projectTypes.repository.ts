import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { ProjectType } from '../entities/ProjectType';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: keyof ProjectType;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig };

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
      take: limitedProjectTypesLength,
    });
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
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

    return projectType;
  }

  async save(projectType: ProjectType) {
    return this.repository.save(projectType);
  }
}
