import { Injectable } from '@nestjs/common';

import { mapFromArray } from '@shared/utils/mapFromArray';

import { UpdateObjectiveSectionDto } from '../dtos/update.objectiveSection.dto';
import { UpdatePositionsObjectiveSectionDto } from '../dtos/updatePositions.objectiveSection.dto';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type IUpdateObjectiveSectionService = UpdateObjectiveSectionDto & {
  id: string;
  organization_id: string;
};

type IUpdatePositions = UpdatePositionsObjectiveSectionDto & { organization_id: string };

@Injectable()
export class UpdateObjectiveSectionService {
  constructor(
    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private commonObjectiveSectionService: CommonObjectiveSectionService,
  ) {}

  async updatePositions({
    newPositions,
    objective_category_id,
    organization_id,
  }: IUpdatePositions) {
    const objectiveSections = await this.objectiveSectionsRepository.findAllByCategory({
      objective_category_id,
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

    const newObjectiveSections = objectiveSections.map(objectiveSection => {
      const positionMap = mapNewPositions[objectiveSection.id];

      let newPosition = objectiveSection.position;

      if (positionMap) {
        newPosition = positionMap;
      } else {
        newPosition = lastPosition;

        lastPosition += 1;
      }

      return {
        ...objectiveSection,
        position: newPosition,
      };
    });

    await this.objectiveSectionsRepository.saveMany(newObjectiveSections);
  }

  async execute({ id, name, organization_id }: IUpdateObjectiveSectionService) {
    const objectiveSection = await this.commonObjectiveSectionService.getObjectiveSection({
      id,
      organization_id,
    });

    const changeName = objectiveSection.name.toLowerCase() !== name.trim().toLowerCase();

    if (changeName) {
      await this.commonObjectiveSectionService.validadeName({
        name,
        organization_id,
        objective_category_id: objectiveSection.objective_category_id,
      });
    }

    objectiveSection.name = name.trim();

    await this.objectiveSectionsRepository.save(objectiveSection);

    return objectiveSection;
  }
}
