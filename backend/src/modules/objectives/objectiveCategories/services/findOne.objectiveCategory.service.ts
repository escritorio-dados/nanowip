import { Injectable } from '@nestjs/common';

import { getPathObjectives } from '@shared/utils/getParentPathObjectives';

import { ObjectiveCategoriesRepository } from '../repositories/objectiveCategories.repository';
import { CommonObjectiveCategoryService } from './common.objectiveCategory.service';

type IFindOneObjectiveCategoryService = {
  id: string;
  organization_id: string;
  relations?: string[];
};

@Injectable()
export class FindOneObjectiveCategoryService {
  constructor(
    private commonObjectiveCategoryService: CommonObjectiveCategoryService,
    private objectiveCategoriesRepository: ObjectiveCategoriesRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneObjectiveCategoryService) {
    const objectiveCategory = await this.objectiveCategoriesRepository.getInfo(id);

    this.commonObjectiveCategoryService.validateObjectiveCategory({
      objectiveCategory,
      organization_id,
    });

    return {
      ...objectiveCategory,
      path: getPathObjectives({
        entity: objectiveCategory,
        entityType: 'objectiveCategory',
        getIntegratedObjective: true,
      }),
      operationalObjective: undefined,
    };
  }

  async execute({ id, organization_id, relations }: IFindOneObjectiveCategoryService) {
    return this.commonObjectiveCategoryService.getObjectiveCategory({
      id,
      organization_id,
      relations,
    });
  }
}
