import { Injectable } from '@nestjs/common';

import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type IFindOneObjectiveSectionService = {
  id: string;
  organization_id: string;
  relations?: string[];
};

@Injectable()
export class FindOneObjectiveSectionService {
  constructor(
    private commonObjectiveSectionService: CommonObjectiveSectionService,
    private objectiveSectionsRepository: ObjectiveSectionsRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneObjectiveSectionService) {
    const objectiveSection = await this.objectiveSectionsRepository.findById({ id });

    this.commonObjectiveSectionService.validateObjectiveSection({
      objectiveSection,
      organization_id,
    });

    return objectiveSection;
  }

  async execute({ id, organization_id, relations }: IFindOneObjectiveSectionService) {
    return this.commonObjectiveSectionService.getObjectiveSection({
      id,
      organization_id,
      relations,
    });
  }
}
