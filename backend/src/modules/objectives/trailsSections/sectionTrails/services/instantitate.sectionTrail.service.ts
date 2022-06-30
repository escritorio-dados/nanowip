import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { FindOneObjectiveCategoryService } from '@modules/objectives/objectiveCategories/services/findOne.objectiveCategory.service';
import { ObjectiveSectionsRepository } from '@modules/objectives/objectiveSections/repositories/objectiveSections.repository';
import { ICreateObjectiveSectionRepository } from '@modules/objectives/objectiveSections/repositories/types';

import { InstantiateSectionTrailDto } from '../dtos/instantiateSectionTrail.dto';
import { sectionTrailErrors } from '../errors/sectionTrail.errors';
import { CommonSectionTrailService } from './common.sectionTrail.service';

type IInstantitateSectionTrailService = InstantiateSectionTrailDto & { organization_id: string };

@Injectable()
export class InstantiateSectionTrailService {
  constructor(
    private commonSectionTrailService: CommonSectionTrailService,

    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private findOneObjectiveCategoryService: FindOneObjectiveCategoryService,
  ) {}

  async execute({
    objective_category_id,
    section_trail_id,
    organization_id,
  }: IInstantitateSectionTrailService) {
    const sectionTrail = await this.commonSectionTrailService.getTrail({
      id: section_trail_id,
      organization_id,
      relations: ['trailSections'],
    });

    const category = await this.findOneObjectiveCategoryService.execute({
      id: objective_category_id,
      organization_id,
      relations: ['objectiveSections'],
    });

    // Não permitir instanciar trilhas em cadeias de valor com seções
    if (category.objectiveSections.length > 0) {
      throw new AppError(sectionTrailErrors.instantiateInCategoryNotEmpty);
    }

    const sectionsCreate = sectionTrail.trailSections.map<ICreateObjectiveSectionRepository>(
      section => ({
        name: section.name,
        position: section.position,
        objectiveCategory: category,
        organization_id,
      }),
    );

    const sectionsCreated = await this.objectiveSectionsRepository.createMany(sectionsCreate);

    return sectionsCreated;
  }
}
