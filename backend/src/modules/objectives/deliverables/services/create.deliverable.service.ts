import { Injectable } from '@nestjs/common';

import { FindOneObjectiveSectionService } from '@modules/objectives/objectiveSections/services/findOne.objectiveSection.service';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';
import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { CreateDeliverableDto } from '../dtos/create.deliverable.dto';
import { DeliverablesRepository } from '../repositories/deliverables.repository';
import { ICreateDeliverableRepository } from '../repositories/types';

type ICreateDeliverableService = CreateDeliverableDto & { organization_id: string };

@Injectable()
export class CreateDeliverableService {
  constructor(
    private deliverablesRepository: DeliverablesRepository,

    private valueChainsRepositoy: ValueChainsRepository,
    private findOneObjectiveSectionService: FindOneObjectiveSectionService,
  ) {}

  async execute({
    name,
    organization_id,
    objective_section_id,
    description,
    goal,
    progress,
    deadline,
    value_chains_id,
  }: ICreateDeliverableService) {
    const newDeliverable = {
      organization_id,
      description,
      deadline,
    } as ICreateDeliverableRepository;

    if (goal) {
      const fixedProgress = !progress ? 0 : progress > goal ? goal : progress;

      newDeliverable.progress = fixedProgress;

      newDeliverable.goal = goal;
    } else if (progress && progress > 0) {
      newDeliverable.progress = progress;

      newDeliverable.goal = progress;
    }

    newDeliverable.name = name.trim();

    newDeliverable.objectiveSection = await this.findOneObjectiveSectionService.execute({
      id: objective_section_id,
      organization_id,
    });

    const lastPosition = await this.deliverablesRepository.getLastPosition(objective_section_id);

    newDeliverable.position = lastPosition + 1;

    // Cadeias de valor
    if (value_chains_id) {
      newDeliverable.valueChains = await this.valueChainsRepositoy.findAllByKeys({
        key: 'id',
        organization_id,
        values: value_chains_id,
        relations: ['tasks'],
      });
    }

    const deliverable = await this.deliverablesRepository.create(newDeliverable);

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
