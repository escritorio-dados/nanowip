import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { ObjectiveSection } from '../entities/ObjectiveSection';
import { objectiveSectionsErrors } from '../errors/objectiveSections.errors';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';

type IGetObjectiveSectionProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameObjectiveSection = {
  name: string;
  organization_id: string;
  objective_category_id: string;
};

type IValidateObjectiveSection = {
  objectiveSection: ObjectiveSection;
  organization_id: string;
};

@Injectable()
export class CommonObjectiveSectionService {
  constructor(private objectiveSectionsRepository: ObjectiveSectionsRepository) {}

  async validadeName({
    name,
    organization_id,
    objective_category_id,
  }: IValidateNameObjectiveSection) {
    const objectiveSection = await this.objectiveSectionsRepository.findByName({
      name: name.trim(),
      organization_id,
      objective_category_id,
    });

    if (objectiveSection) {
      throw new AppError(objectiveSectionsErrors.duplicateName);
    }
  }

  async getObjectiveSection({ id, relations, organization_id }: IGetObjectiveSectionProps) {
    const objectiveSection = await this.objectiveSectionsRepository.findById({
      id,
      relations,
    });

    this.validateObjectiveSection({ objectiveSection, organization_id });

    return objectiveSection;
  }

  validateObjectiveSection({ objectiveSection, organization_id }: IValidateObjectiveSection) {
    if (!objectiveSection) {
      throw new AppError(objectiveSectionsErrors.notFound);
    }

    validateOrganization({ entity: objectiveSection, organization_id });
  }
}
