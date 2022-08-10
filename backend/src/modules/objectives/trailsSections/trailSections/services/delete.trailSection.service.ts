import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { DeleteTagsGroupService } from '@modules/tags/tagsGroups/services/delete.tagsGroup.service';

import { TrailSectionsRepository } from '../repositories/trailSections.repository';
import { CommonTrailSectionService } from './common.trailSection.service';

type IDeleteTrailSectionService = { id: string; organization_id: string };

@Injectable()
export class DeleteTrailSectionService {
  constructor(
    @InjectConnection() private connection: Connection,

    private trailSectionsRepository: TrailSectionsRepository,
    private commonTrailSectionService: CommonTrailSectionService,

    private deleteTagsGroupService: DeleteTagsGroupService,
  ) {}

  async execute({ id, organization_id }: IDeleteTrailSectionService) {
    const trailSection = await this.commonTrailSectionService.getTrailSection({
      id,
      organization_id,
    });

    await this.connection.transaction(async manager => {
      await this.deleteTagsGroupService.execute(
        { id: trailSection.tags_group_id, organization_id },
        manager,
      );

      // Deletando do banco de dados
      await this.trailSectionsRepository.delete(trailSection, manager);
    });
  }
}
