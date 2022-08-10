import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { mapFromArray } from '@shared/utils/mapFromArray';

import { UpdateTagsGroupService } from '@modules/tags/tagsGroups/services/update.tagsGroup.service';

import { UpdateObjectiveSectionDto } from '../dtos/update.objectiveSection.dto';
import { UpdatePositionsObjectiveSectionDto } from '../dtos/updatePositions.objectiveSection.dto';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type IUpdateObjectiveSectionService = UpdateObjectiveSectionDto & {
  id: string;
  organization_id: string;
};

type IUpdatePositions = UpdatePositionsObjectiveSectionDto & { organization_id: string };

@Injectable()
export class UpdateObjectiveSectionService {
  constructor(
    @InjectConnection() private connection: Connection,

    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private commonObjectiveSectionService: CommonObjectiveSectionService,
    private updateTagsGroupService: UpdateTagsGroupService,
  ) {}

  async updatePositions({
    newPositions,
    objective_category_id,
    organization_id,
  }: IUpdatePositions) {
    const objectiveSections = await this.objectiveSectionsRepository.findAllByCategory({
      objective_category_id,
      organization_id,
    });

    const mapNewPositions = mapFromArray(
      newPositions,
      newPosition => newPosition.id,
      newPosition => newPosition.position,
    );

    const biggerNewPosition = Object.values(mapNewPositions).reduce((bigger, position) => {
      return Math.max(bigger, position);
    }, 0);

    let lastPosition = biggerNewPosition + 1;

    const newObjectiveSections = objectiveSections.map(objectiveSection => {
      const positionMap = mapNewPositions[objectiveSection.id];

      let newPosition = objectiveSection.position;

      if (positionMap) {
        newPosition = positionMap;
      } else {
        newPosition = lastPosition;

        lastPosition += 1;
      }

      return {
        ...objectiveSection,
        position: newPosition,
      };
    });

    await this.objectiveSectionsRepository.saveMany(newObjectiveSections);
  }

  async execute({ id, name, organization_id, tags }: IUpdateObjectiveSectionService) {
    const objectiveSection = await this.commonObjectiveSectionService.getObjectiveSection({
      id,
      organization_id,
    });

    const changeName = objectiveSection.name.toLowerCase() !== name.trim().toLowerCase();

    if (changeName) {
      await this.commonObjectiveSectionService.validadeName({
        name,
        organization_id,
        objective_category_id: objectiveSection.objective_category_id,
      });
    }

    objectiveSection.name = name.trim();

    return this.connection.transaction(async manager => {
      // Atualizar tags
      objectiveSection.tags_group_id = await this.updateTagsGroupService.updateTags(
        {
          organization_id,
          newTags: tags,
          tags_group_id: objectiveSection.tags_group_id,
        },
        manager,
      );

      // Salvando alterações na tarefa
      return this.objectiveSectionsRepository.save(objectiveSection, manager);
    });
  }
}
