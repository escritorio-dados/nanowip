import { Injectable } from '@nestjs/common';

import { FindOneOperationalObjectiveService } from '@modules/objectives/operacionalObjectives/services/findOne.operationalObjective.service';

import { ObjectiveCategoryDto } from '../dtos/objectiveCategory.dto';
import { ObjectiveCategoriesRepository } from '../repositories/objectiveCategories.repository';
import { ICreateObjectiveCategoryRepository } from '../repositories/types';
import { CommonObjectiveCategoryService } from './common.objectiveCategory.service';

type ICreateObjectiveCategoryService = ObjectiveCategoryDto & { organization_id: string };

@Injectable()
export class CreateObjectiveCategoryService {
  constructor(
    private objectiveCategoriesRepository: ObjectiveCategoriesRepository,
    private commonObjectiveCategoryService: CommonObjectiveCategoryService,

    private findOneOperationalObjectiveService: FindOneOperationalObjectiveService,
  ) {}

  async execute({
    name,
    organization_id,
    operational_objective_id,
  }: ICreateObjectiveCategoryService) {
    const newObjectiveCategory = { organization_id } as ICreateObjectiveCategoryRepository;

    await this.commonObjectiveCategoryService.validadeName({
      name,
      organization_id,
      operational_objective_id,
    });

    newObjectiveCategory.name = name.trim();

    newObjectiveCategory.operationalObjective = await this.findOneOperationalObjectiveService.execute(
      {
        id: operational_objective_id,
        organization_id,
      },
    );

    const lastPosition = await this.objectiveCategoriesRepository.getLastPosition(
      operational_objective_id,
    );

    newObjectiveCategory.position = lastPosition + 1;

    const objectiveCategory = await this.objectiveCategoriesRepository.create(newObjectiveCategory);

    return objectiveCategory;
  }
}
