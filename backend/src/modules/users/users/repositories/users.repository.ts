import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { DEFAULT_ORGANIZATION_IDS } from '@modules/organizations/seeds/organizations.seeds';

import { User } from '../entities/User';

type ICreateUser = {
  name: string;
  email: string;
  password: string;
  permissions: string[];
  organization_id: string;
};

type IFindAllLimited = IFindLimited & { free?: boolean };

const limitedUsersLength = 100;

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
    const query = this.repository
      .createQueryBuilder('user')
      .where({ organization_id })
      .select(['user.id', 'user.name', 'user.email'])
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

  async findAllLimited({ filters, organization_id, free, customFilters }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email'])
      .orderBy('user.email', 'ASC')
      .where({ organization_id })
      .take(limitedUsersLength);

    if (free) {
      query.leftJoin('user.collaborator', 'collaborator').andWhere('collaborator.id is null');
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

  async findByEmail(email: string, organization_id: string) {
    return this.repository.findOne({ where: { email, organization_id } });
  }

  async findByEmailAcross(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailLogin(email: string, organization_id: string) {
    const users = await this.repository.find({ where: { email }, relations: ['collaborator'] });

    const userNanowip = users.find(
      user => user.organization_id === DEFAULT_ORGANIZATION_IDS.SYSTEM,
    );

    const userOrganization = users.find(user => user.organization_id === organization_id);

    // Se o usuario pertecer ao Nanowip retorna o usuario do Nanowip
    // Se não pertecer ao Nanowip mas possui um usuario na organização solicitada retorna ele
    // Se não possuir acesso a nem o Nanowip nem a organização solicitada vai retornar undefined
    return userNanowip || userOrganization;
  }

  async create(user: ICreateUser) {
    const newUser = this.repository.create(user);

    await this.repository.save(newUser);

    return newUser;
  }

  async delete(user: User) {
    await this.repository.remove(user);
  }

  async save(user: User) {
    return this.repository.save(user);
  }
}
