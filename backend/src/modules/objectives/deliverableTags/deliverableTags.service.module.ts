import { Module } from '@nestjs/common';

import { MilestonesServiceModule } from '@modules/milestones/milestones/milestones.service.module';
import { MilestonesGroupsServiceModule } from '@modules/milestones/milestonesGroups/milestonesGroups.service.module';
import { ValueChainsRepositoryModule } from '@modules/valueChains/valueChains.repository.module';

import { ObjectiveCategoriesServiceModule } from '../objectiveCategories/objectiveCategories.service.module';
import { DeliverableTagsRepositoryModule } from './deliverableTags.repository.module';
import { CommonDeliverableTagService } from './services/common.deliverableTag.service';
import { CreateDeliverableTagService } from './services/create.deliverableTag.service';
import { DeleteDeliverableTagService } from './services/delete.deliverableTag.service';
import { FindAllDeliverableTagService } from './services/findAll.deliverableTag.service';
import { FindOneDeliverableTagService } from './services/findOne.deliverableTag.service';
import { MilestonesDeliverableTagService } from './services/milestones.deliverableTag.service';
import { UpdateDeliverableTagService } from './services/update.deliverableTag.service';

@Module({
  imports: [
    DeliverableTagsRepositoryModule,
    ObjectiveCategoriesServiceModule,
    ValueChainsRepositoryModule,
    MilestonesGroupsServiceModule,
    MilestonesServiceModule,
  ],
  providers: [
    CommonDeliverableTagService,
    CreateDeliverableTagService,
    FindOneDeliverableTagService,
    UpdateDeliverableTagService,
    DeleteDeliverableTagService,
    FindAllDeliverableTagService,
    MilestonesDeliverableTagService,
  ],
  exports: [
    CreateDeliverableTagService,
    FindOneDeliverableTagService,
    UpdateDeliverableTagService,
    DeleteDeliverableTagService,
    FindAllDeliverableTagService,
    MilestonesDeliverableTagService,
  ],
})
export class DeliverableTagsServiceModule {}
