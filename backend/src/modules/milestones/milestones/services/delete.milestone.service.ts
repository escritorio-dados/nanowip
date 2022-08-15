import { Injectable } from '@nestjs/common';

import { DeleteMilestonesGroupService } from '@modules/milestones/milestonesGroups/services/delete.milestonesGroup.service';

import { MilestonesRepository } from '../repositories/milestones.repository';
import { CommonMilestoneService } from './common.milestone.service';

type IDeleteMilestoneService = { id: string; organization_id: string };

@Injectable()
export class DeleteMilestoneService {
  constructor(
    private milestonesRepository: MilestonesRepository,
    private commonMilestoneService: CommonMilestoneService,

    private deleteMilestonesGroupService: DeleteMilestonesGroupService,
  ) {}

  async execute({ id, organization_id }: IDeleteMilestoneService) {
    const milestone = await this.commonMilestoneService.getMilestone({
      id,
      organization_id,
      relations: ['milestonesGroup', 'milestonesGroup.milestones'],
    });

    const remainingMilestones = milestone.milestonesGroup.milestones.length - 1;

    if (remainingMilestones === 0) {
      await this.deleteMilestonesGroupService.execute({
        id: milestone.milestones_group_id,
        organization_id,
      });
    } else {
      await this.milestonesRepository.delete(milestone);
    }
  }
}
