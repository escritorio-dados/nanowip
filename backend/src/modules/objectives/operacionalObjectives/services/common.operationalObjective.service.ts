import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { OperationalObjective } from '../entities/OperationalObjective';
import { operationalObjectivesErrors } from '../errors/operationalObjectives.errors';
import { OperationalObjectivesRepository } from '../repositories/operationalObjectives.repository';

type IGetOperationalObjectiveProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameOperationalObjective = {
  name: string;
  organization_id: string;
  integrated_objective_id: string;
};

type IValidateOperationalObjective = {
  operationalObjective: OperationalObjective;
  organization_id: string;
};

@Injectable()
export class CommonOperationalObjectiveService {
  constructor(private operationalObjectivesRepository: OperationalObjectivesRepository) {}

  async validadeName({
    name,
    organization_id,
    integrated_objective_id,
  }: IValidateNameOperationalObjective) {
    const operationalObjective = await this.operationalObjectivesRepository.findByName({
      name: name.trim(),
      organization_id,
      integrated_objective_id,
    });

    if (operationalObjective) {
      throw new AppError(operationalObjectivesErrors.duplicateName);
    }
  }

  async getOperationalObjective({ id, relations, organization_id }: IGetOperationalObjectiveProps) {
    const operationalObjective = await this.operationalObjectivesRepository.findById({
      id,
      relations,
    });

    this.validateOperationalObjective({ operationalObjective, organization_id });

    return operationalObjective;
  }

  validateOperationalObjective({
    operationalObjective,
    organization_id,
  }: IValidateOperationalObjective) {
    if (!operationalObjective) {
      throw new AppError(operationalObjectivesErrors.notFound);
    }

    validateOrganization({ entity: operationalObjective, organization_id });
  }
}
