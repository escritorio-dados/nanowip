import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { IFindLimited } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';

import { Tag } from '../entities/Tag';
import { ICreateTagReporitory } from './types';

type IFindAllByKeys = { ids: string[]; key: string; organization_id: string; relations?: string[] };

const limitedTagsLength = 100;

@Injectable()
export class TagsRepository {
  constructor(
    @InjectRepository(Tag)
    private repository: Repository<Tag>,
  ) {}

  async findAllByKeys({ ids, key, organization_id, relations }: IFindAllByKeys) {
    return this.repository.find({
      where: { [key]: In(ids), organization_id },
      relations,
    });
  }

  async findAllLimited({ filters, organization_id, customFilters }: IFindLimited) {
    const query = this.repository
      .createQueryBuilder('tag')
      .select(['tag.name'])
      .distinct(true)
      .distinctOn(['tag.name'])
      .orderBy('tag.name', 'ASC')
      .where({ organization_id })
      .take(limitedTagsLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async createMany(data: ICreateTagReporitory[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Tag) : this.repository;

    const tags = repo.create(data);

    await repo.save(tags);

    return tags;
  }

  async deleteMany(tags: Tag[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Tag) : this.repository;

    await repo.remove(tags);
  }
}
