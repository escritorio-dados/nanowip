import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CreateTagService } from '@modules/tags/tags/service/create.tag.service';

import { TagsGroupsRepository } from '../repositories/tagsGroups.repository';

type ICreateTags = { organization_id: string; tags: string[] };

@Injectable()
export class CreateTagsGroupService {
  constructor(
    private tagsGroupsRepository: TagsGroupsRepository,
    private createTagService: CreateTagService,
  ) {}

  async createTags({ organization_id, tags }: ICreateTags, manager?: EntityManager) {
    // Criar um tags_group
    const tagsGroup = await this.tagsGroupsRepository.create(organization_id, manager);

    // Criar todas as tags nesse tags_group
    await this.createTagService.createTags(
      {
        organization_id,
        tags,
        tagsGroup,
      },
      manager,
    );

    return tagsGroup;
  }
}
