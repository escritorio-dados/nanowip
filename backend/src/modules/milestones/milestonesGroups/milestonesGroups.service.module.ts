import { Module } from '@nestjs/common';

import { MilestonesGroupsRepositoryModule } from './milestonesGroups.repository.module';
import { CommonMilestonesGroupService } from './services/common.milestonesGroup.service';
import { CreateMilestonesGroupService } from './services/create.milestonesGroup.service';
import { DeleteMilestonesGroupService } from './services/delete.milestonesGroup.service';

@Module({
  imports: [MilestonesGroupsRepositoryModule],
  providers: [
    CreateMilestonesGroupService,
    DeleteMilestonesGroupService,
    CommonMilestonesGroupService,
  ],
  exports: [
    CreateMilestonesGroupService,
    DeleteMilestonesGroupService,
    CommonMilestonesGroupService,
  ],
})
export class MilestonesGroupsServiceModule {}
