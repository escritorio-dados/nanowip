import { Injectable } from '@nestjs/common';

import { MilestonesRepository } from '../repositories/milestones.repository';
import { CommonMilestoneService } from './common.milestone.service';

type IGetInfo = { id: string; organization_id: string };

@Injectable()
export class FindOneMilestoneService {
  constructor(
    private milestonesRepository: MilestonesRepository,
    private commonMilestoneService: CommonMilestoneService,
  ) {}

  async getInfo({ organization_id, id }: IGetInfo) {
    const milestones = await this.commonMilestoneService.getMilestone({
      id,
      organization_id,
    });

    return milestones;
  }
}
