import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindPagination, paginationSize } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { CollaboratorStatus } from '../entities/CollaboratorStatus';
import { ICreateCollaboratorStatusRepository } from './types';

@Injectable()
export class CollaboratorsStatusRepository {
  constructor(
    @InjectRepository(CollaboratorStatus)
    private repository: Repository<CollaboratorStatus>,
  ) {}

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
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

  async findById(id: string) {
    return this.repository.findOne(id, { relations: ['collaborator'] });
  }

  async findByDateCollaborator(collaborator_id: string, date: Date) {
    return this.repository.findOne({ where: { date, collaborator_id } });
  }

  async create(data: ICreateCollaboratorStatusRepository) {
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
