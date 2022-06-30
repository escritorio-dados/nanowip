import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { objectiveSectionsErrors } from '../errors/objectiveSections.errors';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type IDeleteObjectiveSectionService = { id: string; organization_id: string };

@Injectable()
export class DeleteObjectiveSectionService {
  constructor(
    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private commonObjectiveSectionService: CommonObjectiveSectionService,
  ) {}

  async execute({ id, organization_id }: IDeleteObjectiveSectionService) {
    const objectiveSection = await this.commonObjectiveSectionService.getObjectiveSection({
      id,
      organization_id,
      relations: ['deliverables'],
    });

    if (objectiveSection.deliverables.length > 0) {
      throw new AppError(objectiveSectionsErrors.deleteWithDeliverables);
    }

    await this.objectiveSectionsRepository.delete(objectiveSection);
  }
}
