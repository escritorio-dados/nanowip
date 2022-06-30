import { Injectable } from '@nestjs/common';

import { mapFromArray } from '@shared/utils/mapFromArray';

import { FindOneOperationalObjectiveService } from '@modules/objectives/operacionalObjectives/services/findOne.operationalObjective.service';

import { ObjectiveCategoryDto } from '../dtos/objectiveCategory.dto';
import { UpdatePositionsObjectiveCategoryDto } from '../dtos/updatePositions.objectiveCategory.dto';
import { ObjectiveCategoriesRepository } from '../repositories/objectiveCategories.repository';
import { CommonObjectiveCategoryService } from './common.objectiveCategory.service';

type IUpdateObjectiveCategoryService = ObjectiveCategoryDto & {
  id: string;
  organization_id: string;
};

type IUpdatePositions = UpdatePositionsObjectiveCategoryDto & { organization_id: string };

@Injectable()
export class UpdateObjectiveCategoryService {
  constructor(
    private objectiveCategoriesRepository: ObjectiveCategoriesRepository,
    private commonObjectiveCategoryService: CommonObjectiveCategoryService,

    private findOneOperationalObjectiveService: FindOneOperationalObjectiveService,
  ) {}

  async updatePositions({
    newPositions,
    operational_objective_id,
    organization_id,
  }: IUpdatePositions) {
    const objectiveCategories = await this.objectiveCategoriesRepository.findAllByObjective({
      operational_objective_id,
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

    const newObjectiveCategories = objectiveCategories.map(objectiveCategory => {
      const positionMap = mapNewPositions[objectiveCategory.id];

      let newPosition = objectiveCategory.position;

      if (positionMap) {
        newPosition = positionMap;
      } else {
        newPosition = lastPosition;

        lastPosition += 1;
      }

      return {
        ...objectiveCategory,
        position: newPosition,
      };
    });

    await this.objectiveCategoriesRepository.saveMany(newObjectiveCategories);
  }

  async execute({
    id,
    name,
    organization_id,
    operational_objective_id,
  }: IUpdateObjectiveCategoryService) {
    const objectiveCategory = await this.commonObjectiveCategoryService.getObjectiveCategory({
      id,
      organization_id,
    });

    const changeParent = operational_objective_id !== objectiveCategory.operational_objective_id;

    const changeName = objectiveCategory.name.toLowerCase() !== name.trim().toLowerCase();

    if (changeName || changeParent) {
      await this.commonObjectiveCategoryService.validadeName({
        name,
        organization_id,
        operational_objective_id,
      });
    }

    if (changeParent) {
      objectiveCategory.operationalObjective = await this.findOneOperationalObjectiveService.execute(
        {
          id: operational_objective_id,
          organization_id,
        },
      );

      objectiveCategory.operational_objective_id = operational_objective_id;
    }

    objectiveCategory.name = name.trim();

    await this.objectiveCategoriesRepository.save(objectiveCategory);

    return objectiveCategory;
  }
}
