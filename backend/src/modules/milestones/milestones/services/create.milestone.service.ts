import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { MilestonesGroup } from '@modules/milestones/milestonesGroups/entities/MilestonesGroup';

import { MilestoneDto } from '../dtos/milestone.dto';
import { MilestonesRepository } from '../repositories/milestones.repository';

type ICreateMilestone = MilestoneDto & {
  milestonesGroup: MilestonesGroup;
  organization_id: string;
};

@Injectable()
export class CreateMilestoneService {
  constructor(private milestonesRepository: MilestonesRepository) {}

  async execute(
    { date, milestonesGroup, name, description, organization_id }: ICreateMilestone,
    manager?: EntityManager,
  ) {
    const milestonesCreated = await this.milestonesRepository.create(
      { date, name, milestonesGroup, description, organization_id },
      manager,
    );

    return milestonesCreated;
  }
}
