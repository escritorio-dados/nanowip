import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { TaskType } from '../entities/TaskType';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

const limitedTaskTypesLength = 100;

@Injectable()
export class TaskTypesRepository {
  constructor(
    @InjectRepository(TaskType)
    private repository: Repository<TaskType>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
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
      .createQueryBuilder('taskType')
      .where({ organization_id })
      .select(['taskType.id', 'taskType.name'])
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
      .createQueryBuilder('measure')
      .select(['measure.id', 'measure.name'])
      .orderBy('measure.name', 'ASC')
      .where({ organization_id })
      .take(limitedTaskTypesLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { name: 'ASC' },
    });
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository
      .createQueryBuilder('c')
      .where('c.organization_id = :organization_id', { organization_id })
      .andWhere('Lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async create({ name, organization_id }: ICreate) {
    const taskType = this.repository.create({
      name,
      organization_id,
    });

    await this.repository.save(taskType);

    return taskType;
  }

  async delete(taskType: TaskType) {
    await this.repository.remove(taskType);
  }

  async save(taskType: TaskType) {
    return this.repository.save(taskType);
  }
}
