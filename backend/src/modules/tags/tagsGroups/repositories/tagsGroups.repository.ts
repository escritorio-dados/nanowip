import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { TagsGroup } from '../entities/TagsGroup';

type IFindAllByKeys = { ids: string[]; key: string; organization_id: string; relations?: string[] };

@Injectable()
export class TagsGroupsRepository {
  constructor(
    @InjectRepository(TagsGroup)
    private repository: Repository<TagsGroup>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findAllByKeys({ ids, key, organization_id, relations }: IFindAllByKeys) {
    return this.repository.find({
      where: { [key]: In(ids), organization_id },
      relations,
    });
  }

  async create(organization_id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TagsGroup) : this.repository;

    const id = uuid();

    const tagsGroup = repo.create({ organization_id, id });

    tagsGroup.id = id;

    await repo.save(tagsGroup);

    return tagsGroup;
  }

  async delete(tagsGroup: TagsGroup, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TagsGroup) : this.repository;

    await repo.remove(tagsGroup);
  }

  async deleteMany(tagsGroups: TagsGroup[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TagsGroup) : this.repository;

    await repo.remove(tagsGroups);
  }
}
