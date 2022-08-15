import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { MilestonesGroup } from '../entities/MilestonesGroup';

type IFindAllByKeys = { ids: string[]; key: string; organization_id: string; relations?: string[] };

@Injectable()
export class MilestonesGroupsRepository {
  constructor(
    @InjectRepository(MilestonesGroup)
    private repository: Repository<MilestonesGroup>,
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
    const repo = manager ? manager.getRepository(MilestonesGroup) : this.repository;

    const id = uuid();

    const tagsGroup = repo.create({ organization_id, id });

    tagsGroup.id = id;

    await repo.save(tagsGroup);

    return tagsGroup;
  }

  async delete(tagsGroup: MilestonesGroup, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(MilestonesGroup) : this.repository;

    await repo.remove(tagsGroup);
  }

  async deleteMany(tagsGroups: MilestonesGroup[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(MilestonesGroup) : this.repository;

    await repo.remove(tagsGroups);
  }
}
