import { Injectable } from '@nestjs/common';

import { FindOneIntegratedObjectiveService } from '@modules/objectives/integratedObjectives/services/findOne.integratedObjective.service';

import { OperationalObjectiveDto } from '../dtos/operationalObjective.dto';
import { OperationalObjectivesRepository } from '../repositories/operationalObjectives.repository';
import { CommonOperationalObjectiveService } from './common.operationalObjective.service';

type ICreateOperationalObjectiveService = OperationalObjectiveDto & { organization_id: string };

@Injectable()
export class CreateOperationalObjectiveService {
  constructor(
    private operationalObjectivesRepository: OperationalObjectivesRepository,
    private commonOperationalObjectiveService: CommonOperationalObjectiveService,

    private findOneIntegratedObjectiveService: FindOneIntegratedObjectiveService,
  ) {}

  async execute({
    name,
    organization_id,
    deadline,
    integrated_objective_id,
  }: ICreateOperationalObjectiveService) {
    await this.commonOperationalObjectiveService.validadeName({
      name,
      organization_id,
      integrated_objective_id,
    });

    const integratedObjective = await this.findOneIntegratedObjectiveService.execute({
      id: integrated_objective_id,
      organization_id,
    });

    const operationalObjective = await this.operationalObjectivesRepository.create({
      name: name.trim(),
      organization_id,
      deadline,
      integratedObjective,
    });

    return operationalObjective;
  }
}
