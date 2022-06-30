import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { ObjectiveCategory } from '../entities/ObjectiveCategory';
import { objectiveCategoriesErrors } from '../errors/objectiveCategories.errors';
import { ObjectiveCategoriesRepository } from '../repositories/objectiveCategories.repository';

type IGetObjectiveCategoryProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameObjectiveCategory = {
  name: string;
  organization_id: string;
  operational_objective_id: string;
};

type IValidateObjectiveCategory = {
  objectiveCategory: ObjectiveCategory;
  organization_id: string;
};

@Injectable()
export class CommonObjectiveCategoryService {
  constructor(private objectiveCategoriesRepository: ObjectiveCategoriesRepository) {}

  async validadeName({
    name,
    organization_id,
    operational_objective_id,
  }: IValidateNameObjectiveCategory) {
    const operationalObjective = await this.objectiveCategoriesRepository.findByName({
      name: name.trim(),
      organization_id,
      operational_objective_id,
    });

    if (operationalObjective) {
      throw new AppError(objectiveCategoriesErrors.duplicateName);
    }
  }

  async getObjectiveCategory({ id, relations, organization_id }: IGetObjectiveCategoryProps) {
    const operationalObjective = await this.objectiveCategoriesRepository.findById({
      id,
      relations,
    });

    this.validateObjectiveCategory({ objectiveCategory: operationalObjective, organization_id });

    return operationalObjective;
  }

  validateObjectiveCategory({ objectiveCategory, organization_id }: IValidateObjectiveCategory) {
    if (!objectiveCategory) {
      throw new AppError(objectiveCategoriesErrors.notFound);
    }

    validateOrganization({ entity: objectiveCategory, organization_id });
  }
}
