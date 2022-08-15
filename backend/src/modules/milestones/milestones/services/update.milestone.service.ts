import { Injectable } from '@nestjs/common';

import { MilestoneDto } from '../dtos/milestone.dto';
import { MilestonesRepository } from '../repositories/milestones.repository';
import { CommonMilestoneService } from './common.milestone.service';

type IUpdateMilestone = MilestoneDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateMilestoneService {
  constructor(
    private milestonesRepository: MilestonesRepository,
    private commonMilestoneService: CommonMilestoneService,
  ) {}

  async execute({ id, date, name, description, organization_id }: IUpdateMilestone) {
    const milestone = await this.commonMilestoneService.getMilestone({
      id,
      organization_id,
    });

    milestone.name = name;
    milestone.date = date;
    milestone.description = description;

    await this.milestonesRepository.save(milestone);

    return milestone;
  }
}
