import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { Collaborator } from '../entities/Collaborator';
import { ICreateCollaboratorRepository } from './types';

type IFindAll = { organization_id: string };

type IFindByName = { name: string; organization_id: string };

type IFindAllLimited = IFindLimited & { onlyTrackers?: boolean };

const limitedCollaboratorLength = 100;

@Injectable()
export class CollaboratorsRepository {
  constructor(
    @InjectRepository(Collaborator)
    private repository: Repository<Collaborator>,
  ) {}

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' } });
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
      .createQueryBuilder('collaborator')
      .where({ organization_id })
      .select([
        'collaborator.id',
        'collaborator.name',
        'collaborator.jobTitle',
        'collaborator.type',
      ])
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

  async findAllLimited({ filters, organization_id, onlyTrackers, customFilters }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('collaborator')
      .select(['collaborator.id', 'collaborator.name'])
      .orderBy('collaborator.name', 'ASC')
      .where({ organization_id })
      .take(limitedCollaboratorLength);

    if (onlyTrackers) {
      query.andWhere('collaborator.user_id is not null');
    }

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

  async getInfo(id: string) {
    return this.repository
      .createQueryBuilder('collaborator')
      .where({ id })
      .select(['collaborator', 'user.id', 'user.email'])
      .leftJoin('collaborator.user', 'user')
      .getOne();
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository
      .createQueryBuilder('c')
      .where('c.organization_id = :organization_id', { organization_id })
      .andWhere('lower(c.name) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  async findByUserId(user_id: string) {
    return this.repository.findOne({ where: { user_id } });
  }

  async create(data: ICreateCollaboratorRepository) {
    const collaborator = this.repository.create(data);

    await this.repository.save(collaborator);

    return collaborator;
  }

  async save(collaborator: Collaborator) {
    return this.repository.save(collaborator);
  }

  async delete(collaborator: Collaborator) {
    await this.repository.remove(collaborator);
  }
}
