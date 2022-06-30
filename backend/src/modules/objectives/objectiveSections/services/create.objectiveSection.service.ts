import { Injectable } from '@nestjs/common';

import { FindOneObjectiveCategoryService } from '@modules/objectives/objectiveCategories/services/findOne.objectiveCategory.service';

import { CreateObjectiveSectionDto } from '../dtos/create.objectiveSection.dto';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { ICreateObjectiveSectionRepository } from '../repositories/types';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type ICreateObjectiveSectionService = CreateObjectiveSectionDto & { organization_id: string };

@Injectable()
export class CreateObjectiveSectionService {
  constructor(
    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private commonObjectiveSectionService: CommonObjectiveSectionService,

    private findOneObjectiveCategoryService: FindOneObjectiveCategoryService,
  ) {}

  async execute({ name, organization_id, objective_category_id }: ICreateObjectiveSectionService) {
    const newObjectiveSection = { organization_id } as ICreateObjectiveSectionRepository;

    await this.commonObjectiveSectionService.validadeName({
      name,
      organization_id,
      objective_category_id,
    });

    newObjectiveSection.name = name.trim();

    newObjectiveSection.objectiveCategory = await this.findOneObjectiveCategoryService.execute({
      id: objective_category_id,
      organization_id,
    });

    const lastPosition = await this.objectiveSectionsRepository.getLastPosition(
      objective_category_id,
    );

    newObjectiveSection.position = lastPosition + 1;

    const objectiveSection = await this.objectiveSectionsRepository.create(newObjectiveSection);

    return objectiveSection;
  }
}
