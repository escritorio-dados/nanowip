import { Injectable } from '@nestjs/common';

import { IntegratedObjectiveDto } from '../dtos/integratedObjective.dto';
import { IntegratedObjectivesRepository } from '../repositories/integratedObjectives.repository';
import { CommonIntegratedObjectiveService } from './common.integratedObjective.service';

type ICreateIntegratedObjectiveService = IntegratedObjectiveDto & { organization_id: string };

@Injectable()
export class CreateIntegratedObjectiveService {
  constructor(
    private integratedObjectivesRepository: IntegratedObjectivesRepository,
    private commonIntegratedObjectiveService: CommonIntegratedObjectiveService,
  ) {}

  async execute({ name, organization_id }: ICreateIntegratedObjectiveService) {
    await this.commonIntegratedObjectiveService.validadeName({ name, organization_id });

    const integratedObjective = await this.integratedObjectivesRepository.create({
      name: name.trim(),
      organization_id,
    });

    return integratedObjective;
  }
}
