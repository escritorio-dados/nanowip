import { Injectable } from '@nestjs/common';

import { FindOneObjectiveCategoryService } from '@modules/objectives/objectiveCategories/services/findOne.objectiveCategory.service';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';
import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { CreateDeliverableTagDto } from '../dtos/create.deliverableTag.dto';
import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { ICreateDeliverableTagRepository } from '../repositories/types';

type ICreateDeliverableTagService = CreateDeliverableTagDto & { organization_id: string };

@Injectable()
export class CreateDeliverableTagService {
  constructor(
    private deliverablesRepository: DeliverableTagsRepository,

    private valueChainsRepositoy: ValueChainsRepository,
    private findOneObjectiveCategoryService: FindOneObjectiveCategoryService,
  ) {}

  async execute({
    name,
    organization_id,
    objective_category_id,
    description,
    goal,
    progress,
    deadline,
    value_chains_id,
  }: ICreateDeliverableTagService) {
    const newDeliverableTag = {
      organization_id,
      description,
      deadline,
    } as ICreateDeliverableTagRepository;

    if (goal) {
      const fixedProgress = !progress ? 0 : progress > goal ? goal : progress;

      newDeliverableTag.progress = fixedProgress;

      newDeliverableTag.goal = goal;
    } else if (progress && progress > 0) {
      newDeliverableTag.progress = progress;

      newDeliverableTag.goal = progress;
    }

    newDeliverableTag.name = name.trim();

    newDeliverableTag.objectiveCategory = await this.findOneObjectiveCategoryService.execute({
      id: objective_category_id,
      organization_id,
    });

    // Cadeias de valor
    if (value_chains_id) {
      newDeliverableTag.valueChains = await this.valueChainsRepositoy.findAllByKeys({
        key: 'id',
        organization_id,
        values: value_chains_id,
        relations: ['tasks'],
      });
    }

    const deliverable = await this.deliverablesRepository.create(newDeliverableTag);

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
