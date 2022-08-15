import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { MilestoneDto } from '@modules/milestones/milestones/dtos/milestone.dto';
import { CreateMilestoneService } from '@modules/milestones/milestones/services/create.milestone.service';
import { FindAllMilestoneService } from '@modules/milestones/milestones/services/findAll.milestone.service';
import { CreateMilestonesGroupService } from '@modules/milestones/milestonesGroups/services/create.milestonesGroup.service';

import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { CommonDeliverableTagService } from './common.deliverableTag.service';

type ICreateMilestones = MilestoneDto & {
  organization_id: string;
  deliverable_id: string;
};

type IListMilestones = { deliverable_id: string; organization_id: string };

@Injectable()
export class MilestonesDeliverableTagService {
  constructor(
    @InjectConnection() private connection: Connection,

    private deliverablesRepository: DeliverableTagsRepository,
    private commonDeliverableTagService: CommonDeliverableTagService,

    private createMilestonesGroupService: CreateMilestonesGroupService,
    private createMilestoneService: CreateMilestoneService,
    private findAllMilestoneService: FindAllMilestoneService,
  ) {}

  async list({ organization_id, deliverable_id }: IListMilestones) {
    const deliverable = await this.commonDeliverableTagService.getDeliverableTag({
      id: deliverable_id,
      organization_id,
    });

    if (!deliverable.milestones_group_id) {
      return [];
    }

    return this.findAllMilestoneService.findAllByGroup({
      organization_id,
      milestones_group_id: deliverable.milestones_group_id,
    });
  }

  async create({ name, organization_id, deliverable_id, description, date }: ICreateMilestones) {
    const deliverable = await this.commonDeliverableTagService.getDeliverableTag({
      id: deliverable_id,
      organization_id,
      relations: ['milestonesGroup'],
    });

    const milestone = await this.connection.transaction(async manager => {
      if (!deliverable.milestonesGroup) {
        deliverable.milestonesGroup = await this.createMilestonesGroupService.execute(
          {
            organization_id,
          },
          manager,
        );

        await this.deliverablesRepository.save(deliverable, manager);
      }

      return this.createMilestoneService.execute(
        {
          date,
          milestonesGroup: deliverable.milestonesGroup,
          name,
          organization_id,
          description,
        },
        manager,
      );
    });

    return milestone;
  }
}
