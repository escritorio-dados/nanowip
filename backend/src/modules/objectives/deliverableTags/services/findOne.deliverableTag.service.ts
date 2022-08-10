import { Injectable } from '@nestjs/common';

import { getParentPath } from '@shared/utils/getParentPath';

import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';
import { getActiveTagsValueChains } from '@modules/valueChains/utils/getTagsValueChains';

import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { CommonDeliverableTagService } from './common.deliverableTag.service';

type IFindOneDeliverableTagService = {
  id: string;
  organization_id: string;
  relations?: string[];
};

@Injectable()
export class FindOneDeliverableTagService {
  constructor(
    private commonDeliverableTagService: CommonDeliverableTagService,
    private deliverablesRepository: DeliverableTagsRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneDeliverableTagService) {
    const deliverable = await this.deliverablesRepository.getInfo(id);

    this.commonDeliverableTagService.validateDeliverableTag({
      deliverable,
      organization_id,
    });

    const { progress: progressValueChains, goal: goalValueChains } = getProgressValueChains(
      deliverable.valueChains,
    );

    const tags = getActiveTagsValueChains(deliverable.valueChains);

    return {
      ...deliverable,
      progressValueChains,
      goalValueChains,
      valueChains: deliverable.valueChains.map(valueChain => {
        const { progress, goal } = getProgressValueChains([valueChain]);

        return {
          ...valueChain,
          progress,
          goal,
          path: getParentPath({
            entity: valueChain,
            getCustomer: true,
            entityType: 'valueChain',
            includeEntity: true,
          }),
          product: undefined,
          tasks: undefined,
        };
      }),
      tags,
    };
  }

  async execute({ id, organization_id, relations }: IFindOneDeliverableTagService) {
    return this.commonDeliverableTagService.getDeliverableTag({
      id,
      organization_id,
      relations,
    });
  }
}
