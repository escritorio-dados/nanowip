import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { IntegratedObjective } from '../entities/IntegratedObjective';
import { integratedObjectivesErrors } from '../errors/integratedObjectives.errors';
import { IntegratedObjectivesRepository } from '../repositories/integratedObjectives.repository';

type IGetIntegratedObjectiveProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameIntegratedObjective = { name: string; organization_id: string };

type IValidateIntegratedObjective = {
  integratedObjective: IntegratedObjective;
  organization_id: string;
};

@Injectable()
export class CommonIntegratedObjectiveService {
  constructor(private integratedObjectivesRepository: IntegratedObjectivesRepository) {}

  async validadeName({ name, organization_id }: IValidateNameIntegratedObjective) {
    const integratedObjective = await this.integratedObjectivesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (integratedObjective) {
      throw new AppError(integratedObjectivesErrors.duplicateName);
    }
  }

  async getIntegratedObjective({ id, relations, organization_id }: IGetIntegratedObjectiveProps) {
    const integratedObjective = await this.integratedObjectivesRepository.findById({
      id,
      relations,
    });

    this.validateIntegratedObjective({ integratedObjective, organization_id });

    return integratedObjective;
  }

  validateIntegratedObjective({
    integratedObjective,
    organization_id,
  }: IValidateIntegratedObjective) {
    if (!integratedObjective) {
      throw new AppError(integratedObjectivesErrors.notFound);
    }

    validateOrganization({ entity: integratedObjective, organization_id });
  }
}
