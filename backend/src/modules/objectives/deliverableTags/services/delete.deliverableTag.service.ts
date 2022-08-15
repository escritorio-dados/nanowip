import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { DeleteMilestonesGroupService } from '@modules/milestones/milestonesGroups/services/delete.milestonesGroup.service';

import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { CommonDeliverableTagService } from './common.deliverableTag.service';

type IDeleteDeliverableTagService = { id: string; organization_id: string };

@Injectable()
export class DeleteDeliverableTagService {
  constructor(
    @InjectConnection() private connection: Connection,

    private deliverablesRepository: DeliverableTagsRepository,
    private commonDeliverableTagService: CommonDeliverableTagService,

    private deleteMilestonesGroupService: DeleteMilestonesGroupService,
  ) {}

  async execute({ id, organization_id }: IDeleteDeliverableTagService) {
    const deliverable = await this.commonDeliverableTagService.getDeliverableTag({
      id,
      organization_id,
    });

    await this.connection.transaction(async manager => {
      if (deliverable.milestones_group_id) {
        await this.deleteMilestonesGroupService.execute(
          {
            id: deliverable.milestones_group_id,
            organization_id,
          },
          manager,
        );
      }

      await this.deliverablesRepository.delete(deliverable, manager);
    });
  }
}
