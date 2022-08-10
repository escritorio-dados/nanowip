import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { mapFromArray } from '@shared/utils/mapFromArray';

import { UpdateTagsGroupService } from '@modules/tags/tagsGroups/services/update.tagsGroup.service';

import { UpdateTrailSectionDto } from '../dtos/update.trailSection.dto';
import { UpdatePositionsTrailSectionDto } from '../dtos/updatePositions.trailSection.dto';
import { TrailSectionsRepository } from '../repositories/trailSections.repository';
import { CommonTrailSectionService } from './common.trailSection.service';

type IUpdateTrailSectionService = UpdateTrailSectionDto & {
  id: string;
  organization_id: string;
};

type IUpdatePositions = UpdatePositionsTrailSectionDto & { organization_id: string };

@Injectable()
export class UpdateTrailSectionService {
  constructor(
    @InjectConnection() private connection: Connection,

    private trailSectionsRepository: TrailSectionsRepository,
    private commonTrailSectionService: CommonTrailSectionService,

    private updateTagsGroupService: UpdateTagsGroupService,
  ) {}

  async updatePositions({ newPositions, section_trail_id, organization_id }: IUpdatePositions) {
    const trailSections = await this.trailSectionsRepository.findAllByTrail({
      section_trail_id,
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

    const newTrailSections = trailSections.map(trailSection => {
      const positionMap = mapNewPositions[trailSection.id];

      let newPosition = trailSection.position;

      if (positionMap) {
        newPosition = positionMap;
      } else {
        newPosition = lastPosition;

        lastPosition += 1;
      }

      return {
        ...trailSection,
        position: newPosition,
      };
    });

    await this.trailSectionsRepository.saveMany(newTrailSections);
  }

  async execute({ id, name, organization_id, tags }: IUpdateTrailSectionService) {
    const trailSection = await this.commonTrailSectionService.getTrailSection({
      id,
      organization_id,
    });

    const changeName = trailSection.name.toLowerCase() !== name.trim().toLowerCase();

    if (changeName) {
      await this.commonTrailSectionService.validadeName({
        name,
        organization_id,
        section_trail_id: trailSection.section_trail_id,
      });
    }

    trailSection.name = name.trim();

    return this.connection.transaction(async manager => {
      // Atualizar tags
      trailSection.tags_group_id = await this.updateTagsGroupService.updateTags(
        {
          organization_id,
          newTags: tags,
          tags_group_id: trailSection.tags_group_id,
        },
        manager,
      );

      // Salvando alterações na tarefa
      return this.trailSectionsRepository.save(trailSection, manager);
    });
  }
}
