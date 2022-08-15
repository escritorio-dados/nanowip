import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { DeleteMilestonesGroupService } from '@modules/milestones/milestonesGroups/services/delete.milestonesGroup.service';

import { DeliverablesRepository } from '../repositories/deliverables.repository';
import { CommonDeliverableService } from './common.deliverable.service';

type IDeleteDeliverableService = { id: string; organization_id: string };

@Injectable()
export class DeleteDeliverableService {
  constructor(
    @InjectConnection() private connection: Connection,

    private deliverablesRepository: DeliverablesRepository,
    private commonDeliverableService: CommonDeliverableService,

    private deleteMilestonesGroupService: DeleteMilestonesGroupService,
  ) {}

  async execute({ id, organization_id }: IDeleteDeliverableService) {
    const deliverable = await this.commonDeliverableService.getDeliverable({
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
