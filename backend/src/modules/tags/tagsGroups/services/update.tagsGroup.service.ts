import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CreateTagService } from '@modules/tags/tags/services/create.tag.service';
import { DeleteTagService } from '@modules/tags/tags/services/delete.tag.service';

import { CommonTagsGroupService } from './common.tagsGroup.service';
import { CreateTagsGroupService } from './create.tagsGroup.service';
import { DeleteTagsGroupService } from './delete.tagsGroup.service';

type IUpdateTags = { organization_id: string; newTags: string[]; tags_group_id: string };

type ITagsAction = { [key: string]: ['Delete' | 'Keep' | 'Create', string] };

@Injectable()
export class UpdateTagsGroupService {
  constructor(
    private commonTagsGroupService: CommonTagsGroupService,
    private createTagsGroupService: CreateTagsGroupService,
    private deleteTagsGroupService: DeleteTagsGroupService,

    private createTagService: CreateTagService,
    private deleteTagService: DeleteTagService,
  ) {}

  async updateTags(
    { organization_id, newTags, tags_group_id }: IUpdateTags,
    manager?: EntityManager,
  ) {
    // Criando tags aonde não existia
    if (!tags_group_id) {
      const newTagsGroup = await this.createTagsGroupService.createTags(
        { organization_id, tags: newTags },
        manager,
      );

      return newTagsGroup.id;
    }

    // Removendo todas as tags
    if (newTags.length === 0) {
      await this.deleteTagsGroupService.execute({ id: tags_group_id, organization_id }, manager);

      return null;
    }

    // Validando Mudanças nas Tags, classificando as tags como remover, manter, ou adicionar
    const tagsGroup = await this.commonTagsGroupService.getTagsGroup({
      id: tags_group_id,
      organization_id,
      relations: ['tags'],
    });

    const tagsActions: ITagsAction = {};

    tagsGroup.tags.forEach(tag => {
      tagsActions[tag.name] = ['Delete', tag.id];
    });

    newTags.forEach(newTag => {
      const fixedName = newTag.toLowerCase();

      if (tagsActions[fixedName]) {
        tagsActions[fixedName] = ['Keep', ''];
      } else {
        tagsActions[fixedName] = ['Create', ''];
      }
    });

    const [createTags, deleteTags] = Object.entries(tagsActions).reduce<[string[], string[]]>(
      (tags, [tag, [action, id]]) => {
        if (action === 'Create') {
          return [[...tags[0], tag], tags[1]];
        }

        if (action === 'Delete') {
          return [tags[0], [...tags[1], id]];
        }

        return tags;
      },
      [[], []],
    );

    await this.createTagService.createTags(
      { organization_id, tags: createTags, tagsGroup },
      manager,
    );

    await this.deleteTagService.deleteManyTags({ ids: deleteTags, organization_id }, manager);

    return tags_group_id;
  }
}
