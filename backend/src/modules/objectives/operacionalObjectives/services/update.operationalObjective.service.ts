import { Injectable } from '@nestjs/common';

import { FindOneIntegratedObjectiveService } from '@modules/objectives/integratedObjectives/services/findOne.integratedObjective.service';

import { OperationalObjectiveDto } from '../dtos/operationalObjective.dto';
import { OperationalObjectivesRepository } from '../repositories/operationalObjectives.repository';
import { CommonOperationalObjectiveService } from './common.operationalObjective.service';

type IUpdateOperationalObjectiveService = OperationalObjectiveDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateOperationalObjectiveService {
  constructor(
    private operationalObjectivesRepository: OperationalObjectivesRepository,
    private commonOperationalObjectiveService: CommonOperationalObjectiveService,

    private findOneIntegratedObjectiveService: FindOneIntegratedObjectiveService,
  ) {}

  async execute({
    id,
    name,
    organization_id,
    deadline,
    integrated_objective_id,
  }: IUpdateOperationalObjectiveService) {
    const operationalObjective = await this.commonOperationalObjectiveService.getOperationalObjective(
      { id, organization_id, relations: ['integratedObjective'] },
    );

    const changeParent = integrated_objective_id !== operationalObjective.integrated_objective_id;

    const changeName = operationalObjective.name.toLowerCase() !== name.trim().toLowerCase();

    if (changeName || changeParent) {
      await this.commonOperationalObjectiveService.validadeName({
        name,
        organization_id,
        integrated_objective_id,
      });
    }

    if (changeParent) {
      operationalObjective.integratedObjective = await this.findOneIntegratedObjectiveService.execute(
        { id: integrated_objective_id, organization_id },
      );

      operationalObjective.integrated_objective_id = integrated_objective_id;
    }

    operationalObjective.name = name.trim();

    operationalObjective.deadline = deadline;

    await this.operationalObjectivesRepository.save(operationalObjective);

    return operationalObjective;
  }
}
