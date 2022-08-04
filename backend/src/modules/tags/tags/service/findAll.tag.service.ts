import { Injectable } from '@nestjs/common';

import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';

import { FindAllLimitedTagsQuery } from '../query/findAllLimited.tags.query';
import { TagsRepository } from '../repositories/tags.repository';

@Injectable()
export class FindAllTagService {
  constructor(private tagsRepository: TagsRepository) {}

  async findUniqueTagsLimited({ organization_id, query }: IFindAll<FindAllLimitedTagsQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['tag.'],
      },
    ];

    const tags = await this.tagsRepository.findAllLimited({ organization_id, filters });

    return tags.map(tag => tag.name);
  }
}
