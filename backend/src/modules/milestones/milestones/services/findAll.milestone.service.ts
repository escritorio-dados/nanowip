import { Injectable } from '@nestjs/common';

import { MilestonesRepository } from '../repositories/milestones.repository';

type IFindAllByGroup = { milestones_group_id: string; organization_id: string };

@Injectable()
export class FindAllMilestoneService {
  constructor(private milestonesRepository: MilestonesRepository) {}

  async findAllByGroup({ organization_id, milestones_group_id }: IFindAllByGroup) {
    const milestones = await this.milestonesRepository.findAllByKey({
      key: 'milestones_group_id',
      id: milestones_group_id,
      organization_id,
    });

    return milestones;
  }
}
