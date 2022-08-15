import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { MilestonesGroupsRepository } from '../repositories/milestonesGroups.repository';
import { CommonMilestonesGroupService } from './common.milestonesGroup.service';

type IDeleteMilestonesGroupService = { id: string; organization_id: string };

@Injectable()
export class DeleteMilestonesGroupService {
  constructor(
    private milestonesGroupsRepository: MilestonesGroupsRepository,
    private commonMilestonesGroupService: CommonMilestonesGroupService,
  ) {}

  async execute({ id, organization_id }: IDeleteMilestonesGroupService, manager?: EntityManager) {
    const milestonesGroup = await this.commonMilestonesGroupService.getMilestonesGroup({
      id,
      organization_id,
    });

    await this.milestonesGroupsRepository.delete(milestonesGroup, manager);
  }
}
