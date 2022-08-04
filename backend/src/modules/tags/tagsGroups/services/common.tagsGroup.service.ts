import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { TagsGroup } from '../entities/TagsGroup';
import { tagsGroupErrors } from '../errors/tagsGroup.errors';
import { TagsGroupsRepository } from '../repositories/tagsGroups.repository';

type IGetTagsGroup = { id: string; organization_id: string; relations?: string[] };
type IValidateTagsGroup = { tagsGroup: TagsGroup; organization_id: string };

@Injectable()
export class CommonTagsGroupService {
  constructor(private tagsGroupsRepository: TagsGroupsRepository) {}

  validateTagsGroup({ tagsGroup, organization_id }: IValidateTagsGroup) {
    if (!tagsGroup) {
      throw new AppError(tagsGroupErrors.notFound);
    }

    validateOrganization({ entity: tagsGroup, organization_id });
  }

  async getTagsGroup({ id, organization_id, relations }: IGetTagsGroup) {
    const tagsGroup = await this.tagsGroupsRepository.findById(id, relations);

    this.validateTagsGroup({ tagsGroup, organization_id });

    return tagsGroup;
  }
}
