import { Injectable } from '@nestjs/common';

import { IFindAll } from '@shared/types/types';

import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { FindByCategoryDeliverableQuery } from '../query/findByCategory.deliverableTag.query';
import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { getInfoValueChains } from '../utils/getInfoValueChains';

@Injectable()
export class FindAllDeliverableTagService {
  constructor(private deliverablesRepository: DeliverableTagsRepository) {}

  async findAllByCategoryInfo({
    organization_id,
    query,
  }: IFindAll<FindByCategoryDeliverableQuery>) {
    const deliverables = await this.deliverablesRepository.findAllByCategoryInfo({
      objective_category_id: query.objective_category_id,
      organization_id,
    });

    const deliverablesFormatted = deliverables.map(deliverable => {
      const { progress, goal } = getProgressValueChains(deliverable.valueChains);

      return {
        ...deliverable,
        valueChains: undefined,
        progressValueChains: progress,
        goalValueChains: goal,
      };
    });

    return deliverablesFormatted;
  }

  async findAllByCategory({ organization_id, query }: IFindAll<FindByCategoryDeliverableQuery>) {
    const deliverables = await this.deliverablesRepository.findAllByCategoryInfo({
      objective_category_id: query.objective_category_id,
      organization_id,
    });

    const deliverablesFormatted = deliverables.map(deliverable => {
      const { progress, tags, maxAvailableDate } = getInfoValueChains(deliverable.valueChains);

      return {
        ...deliverable,
        valueChains: undefined,
        progressValueChains: progress.progress,
        goalValueChains: progress.goal,
        tags,
        maxAvailableDate,
      };
    });

    return deliverablesFormatted;
  }
}
