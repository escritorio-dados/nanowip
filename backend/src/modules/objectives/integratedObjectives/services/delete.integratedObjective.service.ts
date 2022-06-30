import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { integratedObjectivesErrors } from '../errors/integratedObjectives.errors';
import { IntegratedObjectivesRepository } from '../repositories/integratedObjectives.repository';
import { CommonIntegratedObjectiveService } from './common.integratedObjective.service';

type IDeleteIntegratedObjectiveService = { id: string; organization_id: string };

@Injectable()
export class DeleteIntegratedObjectiveService {
  constructor(
    private integratedObjectivesRepository: IntegratedObjectivesRepository,
    private commonIntegratedObjectiveService: CommonIntegratedObjectiveService,
  ) {}

  async execute({ id, organization_id }: IDeleteIntegratedObjectiveService) {
    const integratedObjective = await this.commonIntegratedObjectiveService.getIntegratedObjective({
      id,
      relations: ['operationalObjectives'],
      organization_id,
    });

    if (integratedObjective.operationalObjectives.length > 0) {
      throw new AppError(integratedObjectivesErrors.integratedObjectiveWithOperationalObjectives);
    }

    await this.integratedObjectivesRepository.delete(integratedObjective);
  }
}
