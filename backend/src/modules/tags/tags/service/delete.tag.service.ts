import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { TagsRepository } from '../repositories/tags.repository';

type IDeleteMany = { ids: string[]; organization_id: string };

@Injectable()
export class DeleteTagService {
  constructor(private tagsRepository: TagsRepository) {}

  async deleteManyTags({ ids, organization_id }: IDeleteMany, manager?: EntityManager) {
    const tags = await this.tagsRepository.findAllByKeys({
      ids,
      key: 'id',
      organization_id,
    });

    await this.tagsRepository.deleteMany(tags, manager);
  }
}
