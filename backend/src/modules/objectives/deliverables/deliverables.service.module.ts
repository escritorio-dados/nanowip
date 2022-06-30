import { Module } from '@nestjs/common';

import { ValueChainsRepositoryModule } from '@modules/valueChains/valueChains.repository.module';

import { ObjectiveCategoriesServiceModule } from '../objectiveCategories/objectiveCategories.service.module';
import { ObjectiveSectionsServiceModule } from '../objectiveSections/objectiveSections.service.module';
import { DeliverablesRepositoryModule } from './deliverables.repository.module';
import { CommonDeliverableService } from './services/common.deliverable.service';
import { CreateDeliverableService } from './services/create.deliverable.service';
import { DeleteDeliverableService } from './services/delete.deliverable.service';
import { FindAllDeliverableService } from './services/findAll.deliverable.service';
import { FindOneDeliverableService } from './services/findOne.deliverable.service';
import { UpdateDeliverableService } from './services/update.deliverable.service';

@Module({
  imports: [
    DeliverablesRepositoryModule,
    ObjectiveCategoriesServiceModule,
    ObjectiveSectionsServiceModule,
    ValueChainsRepositoryModule,
  ],
  providers: [
    CommonDeliverableService,
    CreateDeliverableService,
    FindOneDeliverableService,
    UpdateDeliverableService,
    DeleteDeliverableService,
    FindAllDeliverableService,
  ],
  exports: [
    CreateDeliverableService,
    FindOneDeliverableService,
    UpdateDeliverableService,
    DeleteDeliverableService,
    FindAllDeliverableService,
  ],
})
export class DeliverablesServiceModule {}
