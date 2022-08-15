import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { MilestonesGroupsRepository } from '../repositories/milestonesGroups.repository';

type ICreateMilestones = { organization_id: string };

@Injectable()
export class CreateMilestonesGroupService {
  constructor(private milestonesGroupsRepository: MilestonesGroupsRepository) {}

  async execute({ organization_id }: ICreateMilestones, manager?: EntityManager) {
    const milestonesGroup = await this.milestonesGroupsRepository.create(organization_id, manager);

    return milestonesGroup;
  }
}
