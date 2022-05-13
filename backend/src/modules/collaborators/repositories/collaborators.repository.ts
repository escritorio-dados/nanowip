import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, IsNull, Not, FindConditions } from 'typeorm';

import { paginationSizeLarge } from '@shared/types/pagination';
import {
  configFiltersRepository,
  IFilterConfig,
} from '@shared/utils/filter/configFiltersRepository';

import { ICreateCollaboratorRepositoryDto } from '../dtos/create.collaborator.repository.dto';
import { Collaborator } from '../entities/Collaborator';

type IFindAll = { organization_id: string };

type IFindByName = { name: string; organization_id: string };

type IFindAllPagination = {
  organization_id: string;
  sort_by: string;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterConfig;
};

type IFindAllLimited = { organization_id: string; filters?: IFilterConfig; onlyTrackers?: boolean };

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
  }: IFindAllPagination) {
    return this.repository.findAndCount({
      where: { organization_id, ...configFiltersRepository(filters) },
      select: ['id', 'name', 'jobTitle', 'type'],
      order: { [sort_by]: order_by },
      take: paginationSizeLarge,
      skip: (page - 1) * paginationSizeLarge,
    });
  }

  async findAllLimited({ filters, organization_id, onlyTrackers }: IFindAllLimited) {
    const where: FindConditions<Collaborator> = {
      organization_id,
      ...configFiltersRepository(filters),
    };

    if (onlyTrackers) {
      where.user_id = Not(IsNull());
    }

    return this.repository.find({
      where,
      select: ['id', 'name'],
      order: { name: 'ASC' },
      take: limitedCollaboratorLength,
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

  async create(data: ICreateCollaboratorRepositoryDto) {
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
