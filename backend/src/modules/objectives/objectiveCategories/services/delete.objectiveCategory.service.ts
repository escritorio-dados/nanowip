import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { objectiveCategoriesErrors } from '../errors/objectiveCategories.errors';
import { ObjectiveCategoriesRepository } from '../repositories/objectiveCategories.repository';
import { CommonObjectiveCategoryService } from './common.objectiveCategory.service';

type IDeleteObjectiveCategoryService = { id: string; organization_id: string };

@Injectable()
export class DeleteObjectiveCategoryService {
  constructor(
    private objectiveCategoriesRepository: ObjectiveCategoriesRepository,
    private commonObjectiveCategoryService: CommonObjectiveCategoryService,
  ) {}

  async execute({ id, organization_id }: IDeleteObjectiveCategoryService) {
    const objectiveCategory = await this.commonObjectiveCategoryService.getObjectiveCategory({
      id,
      relations: ['objectiveSections'],
      organization_id,
    });

    if (objectiveCategory.objectiveSections.length > 0) {
      throw new AppError(objectiveCategoriesErrors.deleteWithSections);
    }

    await this.objectiveCategoriesRepository.delete(objectiveCategory);
  }
}
