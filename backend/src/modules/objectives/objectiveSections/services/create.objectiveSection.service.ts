import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { FindOneObjectiveCategoryService } from '@modules/objectives/objectiveCategories/services/findOne.objectiveCategory.service';
import { CreateTagsGroupService } from '@modules/tags/tagsGroups/services/create.tagsGroup.service';

import { CreateObjectiveSectionDto } from '../dtos/create.objectiveSection.dto';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { ICreateObjectiveSectionRepository } from '../repositories/types';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type ICreateObjectiveSectionService = CreateObjectiveSectionDto & { organization_id: string };

type ICreateFromTrail = {
  name: string;
  tags: string[];
  organization_id: string;
  position: number;
  manager: EntityManager;
  category: ObjectiveCategory;
};

@Injectable()
export class CreateObjectiveSectionService {
  constructor(
    @InjectConnection() private connection: Connection,

    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private commonObjectiveSectionService: CommonObjectiveSectionService,

    private findOneObjectiveCategoryService: FindOneObjectiveCategoryService,
    private createTagsGroupService: CreateTagsGroupService,
  ) {}

  async createFromTrail({
    name,
    organization_id,
    tags,
    position,
    manager,
    category,
  }: ICreateFromTrail) {
    const newObjectiveSection = { organization_id, position } as ICreateObjectiveSectionRepository;

    newObjectiveSection.name = name.trim();

    newObjectiveSection.objectiveCategory = category;

    if (tags) {
      const tagsGroup = await this.createTagsGroupService.createTags(
        { organization_id, tags },
        manager,
      );

      newObjectiveSection.tagsGroup = tagsGroup;
    }

    return this.objectiveSectionsRepository.create(newObjectiveSection, manager);
  }

  async execute({
    name,
    organization_id,
    objective_category_id,
    tags,
  }: ICreateObjectiveSectionService) {
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

    return this.connection.transaction(async manager => {
      if (tags) {
        const tagsGroup = await this.createTagsGroupService.createTags(
          { organization_id, tags },
          manager,
        );

        newObjectiveSection.tagsGroup = tagsGroup;
      }

      return this.objectiveSectionsRepository.create(newObjectiveSection, manager);
    });
  }
}
