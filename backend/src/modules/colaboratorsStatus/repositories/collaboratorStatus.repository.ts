import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';

import { ICreateCollaboratorStatusRepositoryDto } from '../dtos/create.collaboratorStatus.repository.dto';
import { CollaboratorStatus } from '../entities/CollaboratorStatus';

type IFindAll = { organization_id: string };
type IFindByDate = { date: Date; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

@Injectable()
export class CollaboratorsStatusRepository {
  constructor(
    @InjectRepository(CollaboratorStatus)
    private repository: Repository<CollaboratorStatus>,
  ) {}

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { date: 'ASC' } });
  }

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindAllPagination) {
    const fieldsEntity = ['id', 'date', 'salary', 'monthHours', 'updated_at', 'created_at'];

    const fields = [
      ...fieldsEntity.map(field => `collaboratorStatus.${field}`),
      'collaborator.id',
      'collaborator.name',
    ];

    const query = this.repository
      .createQueryBuilder('collaboratorStatus')
      .leftJoin('collaboratorStatus.collaborator', 'collaborator')
      .where({ organization_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { date: 'ASC' },
    });
  }

  async findById(id: string) {
    return this.repository.findOne(id, { relations: ['collaborator'] });
  }

  async findByDateCollaborator(collaborator_id: string, date: Date) {
    return this.repository.findOne({ where: { date, collaborator_id } });
  }

  async findByDate({ date, organization_id }: IFindByDate) {
    return this.repository.find({ where: { date, organization_id } });
  }

  async findByCollaborator(collaborator_id: string) {
    return this.repository.find({ where: { collaborator_id } });
  }

  async findByManyCollaborators(collaborators_id: string[]) {
    return this.repository.find({ where: { collaborator_id: In(collaborators_id) } });
  }

  async create(data: ICreateCollaboratorStatusRepositoryDto) {
    const collaborator = this.repository.create(data);

    await this.repository.save(collaborator);

    return collaborator;
  }

  async save(collaborator: CollaboratorStatus) {
    return this.repository.save(collaborator);
  }

  async delete(collaborator: CollaboratorStatus) {
    await this.repository.remove(collaborator);
  }
}
