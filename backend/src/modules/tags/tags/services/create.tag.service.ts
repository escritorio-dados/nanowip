import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

import { TagsRepository } from '../repositories/tags.repository';
import { ICreateTagReporitory } from '../repositories/types';

type ICreateTags = { organization_id: string; tags: string[]; tagsGroup: TagsGroup };

@Injectable()
export class CreateTagService {
  constructor(private tagsRepository: TagsRepository) {}

  async createTags({ organization_id, tags, tagsGroup }: ICreateTags, manager?: EntityManager) {
    const tagsData = tags.map<ICreateTagReporitory>(tag => ({
      name: tag.toLowerCase(),
      organization_id,
      tagsGroup,
      tags_group_id: tagsGroup.id,
    }));

    const tagsCreated = await this.tagsRepository.createMany(tagsData, manager);

    return tagsCreated;
  }
}
