import { Module } from '@nestjs/common';

import { ValueChainsRepositoryModule } from '@modules/valueChains/valueChains.repository.module';

import { ObjectiveCategoriesServiceModule } from '../objectiveCategories/objectiveCategories.service.module';
import { DeliverableTagsRepositoryModule } from './deliverableTags.repository.module';
import { CommonDeliverableTagService } from './services/common.deliverableTag.service';
import { CreateDeliverableTagService } from './services/create.deliverableTag.service';
import { DeleteDeliverableTagService } from './services/delete.deliverableTag.service';
import { FindAllDeliverableTagService } from './services/findAll.deliverableTag.service';
import { FindOneDeliverableTagService } from './services/findOne.deliverableTag.service';
import { UpdateDeliverableTagService } from './services/update.deliverableTag.service';

@Module({
  imports: [
    DeliverableTagsRepositoryModule,
    ObjectiveCategoriesServiceModule,
    ValueChainsRepositoryModule,
  ],
  providers: [
    CommonDeliverableTagService,
    CreateDeliverableTagService,
    FindOneDeliverableTagService,
    UpdateDeliverableTagService,
    DeleteDeliverableTagService,
    FindAllDeliverableTagService,
  ],
  exports: [
    CreateDeliverableTagService,
    FindOneDeliverableTagService,
    UpdateDeliverableTagService,
    DeleteDeliverableTagService,
    FindAllDeliverableTagService,
  ],
})
export class DeliverableTagsServiceModule {}
