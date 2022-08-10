import { Injectable } from '@nestjs/common';

import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';
import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { UpdateDeliverableTagDto } from '../dtos/update.deliverableTag.dto';
import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { CommonDeliverableTagService } from './common.deliverableTag.service';

type IUpdateDeliverableTagService = UpdateDeliverableTagDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateDeliverableTagService {
  constructor(
    private deliverablesRepository: DeliverableTagsRepository,
    private commonDeliverableTagService: CommonDeliverableTagService,

    private valueChainsRepositoy: ValueChainsRepository,
  ) {}

  async execute({
    id,
    name,
    organization_id,
    description,
    goal,
    progress,
    deadline,
    value_chains_id,
  }: IUpdateDeliverableTagService) {
    const deliverable = await this.commonDeliverableTagService.getDeliverableTag({
      id,
      organization_id,
    });

    if (goal) {
      const fixedProgress = !progress ? 0 : progress > goal ? goal : progress;

      deliverable.progress = fixedProgress;

      deliverable.goal = goal;
    } else if (progress && progress > 0) {
      deliverable.progress = progress;

      deliverable.goal = progress;
    } else {
      deliverable.progress = null;

      deliverable.goal = null;
    }

    deliverable.name = name.trim();
    deliverable.description = description;
    deliverable.deadline = deadline;

    if (value_chains_id) {
      deliverable.valueChains = await this.valueChainsRepositoy.findAllByKeys({
        key: 'id',
        organization_id,
        values: value_chains_id,
        relations: ['tasks'],
      });
    } else {
      deliverable.valueChains = [];
    }

    await this.deliverablesRepository.save(deliverable);

    const { progress: progressValueChains, goal: goalValueChains } = getProgressValueChains(
      deliverable.valueChains,
    );

    return {
      ...deliverable,
      valueChains: undefined,
      progressValueChains,
      goalValueChains,
    };
  }
}
