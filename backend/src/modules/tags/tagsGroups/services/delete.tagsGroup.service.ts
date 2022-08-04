import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { TagsGroupsRepository } from '../repositories/tagsGroups.repository';
import { CommonTagsGroupService } from './common.tagsGroup.service';

type IDeleteTagsGroupService = { id: string; organization_id: string };

type IDeleteMany = { ids: string[]; organization_id: string };

@Injectable()
export class DeleteTagsGroupService {
  constructor(
    private tagsGroupsRepository: TagsGroupsRepository,
    private commonTagsGroupService: CommonTagsGroupService,
  ) {}

  async deleteMany({ ids, organization_id }: IDeleteMany, manager?: EntityManager) {
    const tagsGroups = await this.tagsGroupsRepository.findAllByKeys({
      ids,
      key: 'id',
      organization_id,
    });

    await this.tagsGroupsRepository.deleteMany(tagsGroups, manager);
  }

  async execute({ id, organization_id }: IDeleteTagsGroupService, manager?: EntityManager) {
    const tagsGroup = await this.tagsGroupsRepository.findById(id);

    this.commonTagsGroupService.validateTagsGroup({ tagsGroup, organization_id });

    await this.tagsGroupsRepository.delete(tagsGroup, manager);
  }
}
