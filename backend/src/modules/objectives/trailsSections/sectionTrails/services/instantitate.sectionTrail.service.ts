import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { AppError } from '@shared/errors/AppError';

import { FindOneObjectiveCategoryService } from '@modules/objectives/objectiveCategories/services/findOne.objectiveCategory.service';
import { ObjectiveSection } from '@modules/objectives/objectiveSections/entities/ObjectiveSection';
import { CreateObjectiveSectionService } from '@modules/objectives/objectiveSections/services/create.objectiveSection.service';

import { InstantiateSectionTrailDto } from '../dtos/instantiateSectionTrail.dto';
import { sectionTrailErrors } from '../errors/sectionTrail.errors';
import { SectionTrailsRepository } from '../repositories/sectionTrails.repository';
import { CommonSectionTrailService } from './common.sectionTrail.service';

type IInstantitateSectionTrailService = InstantiateSectionTrailDto & { organization_id: string };

@Injectable()
export class InstantiateSectionTrailService {
  constructor(
    @InjectConnection() private connection: Connection,

    private commonSectionTrailService: CommonSectionTrailService,
    private sectionTrailsRepository: SectionTrailsRepository,

    private findOneObjectiveCategoryService: FindOneObjectiveCategoryService,
    private createObjectiveSectionService: CreateObjectiveSectionService,
  ) {}

  async execute({
    objective_category_id,
    section_trail_id,
    organization_id,
  }: IInstantitateSectionTrailService) {
    const sectionTrail = await this.sectionTrailsRepository.getTrailToInstantiate(section_trail_id);

    this.commonSectionTrailService.validateTrail({ sectionTrail, organization_id });

    const category = await this.findOneObjectiveCategoryService.execute({
      id: objective_category_id,
      organization_id,
      relations: ['objectiveSections'],
    });

    // Não permitir instanciar trilhas em cadeias de valor com seções
    if (category.objectiveSections.length > 0) {
      throw new AppError(sectionTrailErrors.instantiateInCategoryNotEmpty);
    }

    return this.connection.transaction(async manager => {
      const sections: ObjectiveSection[] = [];

      for await (const sectionToCreate of sectionTrail.trailSections) {
        const section = await this.createObjectiveSectionService.createFromTrail({
          category,
          manager,
          name: sectionToCreate.name,
          organization_id,
          position: sectionToCreate.position,
          tags: sectionToCreate.tagsGroup
            ? sectionToCreate.tagsGroup.tags.map(tag => tag.name)
            : [],
        });

        sections.push(section);
      }

      return sections;
    });
  }
}
