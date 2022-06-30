import { Injectable } from '@nestjs/common';

import { IFindAll } from '@shared/types/types';

import { FindByObjectiveObjectiveCategoryQuery } from '../query/findByObjective.objectiveCategory.query';
import { ObjectiveCategoriesRepository } from '../repositories/objectiveCategories.repository';

@Injectable()
export class FindAllObjectiveCategoryService {
  constructor(private objectiveCategoriesRepository: ObjectiveCategoriesRepository) {}

  async findAllByObjective({
    organization_id,
    query,
  }: IFindAll<FindByObjectiveObjectiveCategoryQuery>) {
    const objectiveCategories = await this.objectiveCategoriesRepository.findAllByObjectiveInfo({
      operational_objective_id: query.operational_objective_id,
      organization_id,
    });

    return objectiveCategories;
  }
}
