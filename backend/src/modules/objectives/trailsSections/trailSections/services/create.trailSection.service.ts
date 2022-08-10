import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { CreateTagsGroupService } from '@modules/tags/tagsGroups/services/create.tagsGroup.service';

import { FindOneSectionTrailService } from '../../sectionTrails/services/findOne.sectionTrail.service';
import { CreateTrailSectionDto } from '../dtos/create.trailSection.dto';
import { TrailSectionsRepository } from '../repositories/trailSections.repository';
import { ICreateTrailSectionRepository } from '../repositories/types';
import { CommonTrailSectionService } from './common.trailSection.service';

type ICreateTrailSectionService = CreateTrailSectionDto & { organization_id: string };

@Injectable()
export class CreateTrailSectionService {
  constructor(
    @InjectConnection() private connection: Connection,

    private trailSectionsRepository: TrailSectionsRepository,
    private commonTrailSectionService: CommonTrailSectionService,

    private findOneSectionTrailService: FindOneSectionTrailService,
    private createTagsGroupService: CreateTagsGroupService,
  ) {}

  async execute({ name, organization_id, section_trail_id, tags }: ICreateTrailSectionService) {
    const newTrailSection = { organization_id } as ICreateTrailSectionRepository;

    await this.commonTrailSectionService.validadeName({
      name,
      organization_id,
      section_trail_id,
    });

    newTrailSection.name = name.trim();

    newTrailSection.sectionTrail = await this.findOneSectionTrailService.execute({
      id: section_trail_id,
      organization_id,
    });

    const lastPosition = await this.trailSectionsRepository.getLastPosition(section_trail_id);

    newTrailSection.position = lastPosition + 1;

    return this.connection.transaction(async manager => {
      if (tags) {
        const tagsGroup = await this.createTagsGroupService.createTags(
          { organization_id, tags },
          manager,
        );

        newTrailSection.tagsGroup = tagsGroup;
      }

      return this.trailSectionsRepository.create(newTrailSection, manager);
    });
  }
}
