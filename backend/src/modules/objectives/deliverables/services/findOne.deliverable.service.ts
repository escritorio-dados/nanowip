import { Injectable } from '@nestjs/common';

import { getParentPath } from '@shared/utils/getParentPath';

import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { DeliverablesRepository } from '../repositories/deliverables.repository';
import { CommonDeliverableService } from './common.deliverable.service';

type IFindOneDeliverableService = {
  id: string;
  organization_id: string;
  relations?: string[];
};

@Injectable()
export class FindOneDeliverableService {
  constructor(
    private commonDeliverableService: CommonDeliverableService,
    private deliverablesRepository: DeliverablesRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneDeliverableService) {
    const deliverable = await this.deliverablesRepository.getInfo(id);

    this.commonDeliverableService.validateDeliverable({
      deliverable,
      organization_id,
    });

    const { progress: progressValueChains, goal: goalValueChains } = getProgressValueChains(
      deliverable.valueChains,
    );

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
    };
  }

  async execute({ id, organization_id, relations }: IFindOneDeliverableService) {
    return this.commonDeliverableService.getDeliverable({
      id,
      organization_id,
      relations,
    });
  }
}
