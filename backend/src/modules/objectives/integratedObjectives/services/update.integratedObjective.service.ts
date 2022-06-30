import { Injectable } from '@nestjs/common';

import { IntegratedObjectiveDto } from '../dtos/integratedObjective.dto';
import { IntegratedObjectivesRepository } from '../repositories/integratedObjectives.repository';
import { CommonIntegratedObjectiveService } from './common.integratedObjective.service';

type IUpdateIntegratedObjectiveService = IntegratedObjectiveDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateIntegratedObjectiveService {
  constructor(
    private integratedObjectivesRepository: IntegratedObjectivesRepository,
    private commonIntegratedObjectiveService: CommonIntegratedObjectiveService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateIntegratedObjectiveService) {
    const integratedObjective = await this.commonIntegratedObjectiveService.getIntegratedObjective({
      id,
      organization_id,
    });

    if (integratedObjective.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonIntegratedObjectiveService.validadeName({ name, organization_id });
    }

    integratedObjective.name = name.trim();

    await this.integratedObjectivesRepository.save(integratedObjective);

    return integratedObjective;
  }
}
