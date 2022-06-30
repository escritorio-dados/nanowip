import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { operationalObjectivesErrors } from '../errors/operationalObjectives.errors';
import { OperationalObjectivesRepository } from '../repositories/operationalObjectives.repository';
import { CommonOperationalObjectiveService } from './common.operationalObjective.service';

type IDeleteOperationalObjectiveService = { id: string; organization_id: string };

@Injectable()
export class DeleteOperationalObjectiveService {
  constructor(
    private operationalObjectivesRepository: OperationalObjectivesRepository,
    private commonOperationalObjectiveService: CommonOperationalObjectiveService,
  ) {}

  async execute({ id, organization_id }: IDeleteOperationalObjectiveService) {
    const operationalObjective = await this.commonOperationalObjectiveService.getOperationalObjective(
      {
        id,
        relations: ['objectiveCategories'],
        organization_id,
      },
    );

    if (operationalObjective.objectiveCategories.length > 0) {
      throw new AppError(operationalObjectivesErrors.operationalObjectiveWithCategories);
    }

    await this.operationalObjectivesRepository.delete(operationalObjective);
  }
}
