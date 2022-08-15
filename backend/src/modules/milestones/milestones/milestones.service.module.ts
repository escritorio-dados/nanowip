import { Module } from '@nestjs/common';

import { MilestonesGroupsServiceModule } from '../milestonesGroups/milestonesGroups.service.module';
import { MilestonesRepositoryModule } from './milestones.repository.module';
import { CommonMilestoneService } from './services/common.milestone.service';
import { CreateMilestoneService } from './services/create.milestone.service';
import { DeleteMilestoneService } from './services/delete.milestone.service';
import { FindAllMilestoneService } from './services/findAll.milestone.service';
import { FindOneMilestoneService } from './services/findOne.milestone.service';
import { UpdateMilestoneService } from './services/update.milestone.service';

@Module({
  imports: [MilestonesRepositoryModule, MilestonesGroupsServiceModule],
  providers: [
    CreateMilestoneService,
    FindAllMilestoneService,
    CommonMilestoneService,
    DeleteMilestoneService,
    FindOneMilestoneService,
    UpdateMilestoneService,
  ],
  exports: [
    CreateMilestoneService,
    FindAllMilestoneService,
    CommonMilestoneService,
    DeleteMilestoneService,
    FindOneMilestoneService,
    UpdateMilestoneService,
  ],
})
export class MilestonesServiceModule {}
