import { Injectable } from '@nestjs/common';

import { mapFromArray } from '@shared/utils/mapFromArray';

import { FindOneObjectiveSectionService } from '@modules/objectives/objectiveSections/services/findOne.objectiveSection.service';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';
import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { ChangeSectionDeliverableDto } from '../dtos/changeSection.deliverable.dto';
import { UpdateDeliverableDto } from '../dtos/update.deliverable.dto';
import { UpdatePositionsDeliverableDto } from '../dtos/updatePositions.deliverable.dto';
import { DeliverablesRepository } from '../repositories/deliverables.repository';
import { CommonDeliverableService } from './common.deliverable.service';

type IUpdateDeliverableService = UpdateDeliverableDto & {
  id: string;
  organization_id: string;
};

type IUpdatePositions = UpdatePositionsDeliverableDto & { organization_id: string };

type IChangeSection = ChangeSectionDeliverableDto & { id: string; organization_id: string };

@Injectable()
export class UpdateDeliverableService {
  constructor(
    private deliverablesRepository: DeliverablesRepository,
    private commonDeliverableService: CommonDeliverableService,

    private valueChainsRepositoy: ValueChainsRepository,
    private findOneObjectiveSectionService: FindOneObjectiveSectionService,
  ) {}

  async updatePositions({ newPositions, objective_section_id, organization_id }: IUpdatePositions) {
    const deliverables = await this.deliverablesRepository.findAllBySection({
      objective_section_id,
      organization_id,
    });

    const mapNewPositions = mapFromArray(
      newPositions,
      newPosition => newPosition.id,
      newPosition => newPosition.position,
    );

    const biggerNewPosition = Object.values(mapNewPositions).reduce((bigger, position) => {
      return Math.max(bigger, position);
    }, 0);

    let lastPosition = biggerNewPosition + 1;

    const newDeliverables = deliverables.map(deliverable => {
      const positionMap = mapNewPositions[deliverable.id];

      let newPosition = deliverable.position;

      if (positionMap) {
        newPosition = positionMap;
      } else {
        newPosition = lastPosition;

        lastPosition += 1;
      }

      return {
        ...deliverable,
        position: newPosition,
      };
    });

    await this.deliverablesRepository.saveMany(newDeliverables);
  }

  async changeSection({ id, new_section_id, organization_id }: IChangeSection) {
    const deliverable = await this.commonDeliverableService.getDeliverable({
      id,
      organization_id,
    });

    await this.findOneObjectiveSectionService.execute({ organization_id, id: new_section_id });

    const lastPositionNewSection = await this.deliverablesRepository.getLastPosition(
      new_section_id,
    );

    deliverable.position = lastPositionNewSection + 1;

    deliverable.objective_section_id = new_section_id;

    await this.deliverablesRepository.save(deliverable);

    return deliverable;
  }

  async execute({
    id,
    name,
    organization_id,
    description,
    goal,
    progress,
    deadline,
    value_chains_id,
  }: IUpdateDeliverableService) {
    const deliverable = await this.commonDeliverableService.getDeliverable({
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
