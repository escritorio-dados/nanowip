import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { AppError } from '@shared/errors/AppError';

import { DeleteTagsGroupService } from '@modules/tags/tagsGroups/services/delete.tagsGroup.service';

import { objectiveSectionsErrors } from '../errors/objectiveSections.errors';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';
import { CommonObjectiveSectionService } from './common.objectiveSection.service';

type IDeleteObjectiveSectionService = { id: string; organization_id: string };

@Injectable()
export class DeleteObjectiveSectionService {
  constructor(
    @InjectConnection() private connection: Connection,

    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private commonObjectiveSectionService: CommonObjectiveSectionService,

    private deleteTagsGroupService: DeleteTagsGroupService,
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

    await this.connection.transaction(async manager => {
      if (objectiveSection.tags_group_id) {
        await this.deleteTagsGroupService.execute(
          { id: objectiveSection.tags_group_id, organization_id },
          manager,
        );
      }

      // Deletando do banco de dados
      await this.objectiveSectionsRepository.delete(objectiveSection, manager);
    });
  }
}
