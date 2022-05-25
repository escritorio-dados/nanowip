import { forwardRef, Module } from '@nestjs/common';

import { AssignmentsServiceModule } from '@modules/assignments/assignments.service.module';
import { ProductsServiceModule } from '@modules/products/products.service.module';
import { TasksRepositoryModule } from '@modules/tasks/tasks/tasks.repository.module';
import { TasksServiceModule } from '@modules/tasks/tasks/tasks.service.module';

import { CommonValueChainService } from './services/common.valueChain.service';
import { CreateValueChainService } from './services/create.valueChain.service';
import { DeleteValueChainService } from './services/delete.valueChain.service';
import { FindAllValueChainService } from './services/findAll.valueChain.service';
import { FindOneValueChainService } from './services/findOne.valueChain.service';
import { FixDatesValueChainService } from './services/fixDates.valueChain.service';
import { RecalculateDatesValueChainService } from './services/recalculateDates.valueChain.service';
import { UpdateValueChainService } from './services/update.valueChain.service';
import { ValueChainsRepositoryModule } from './valueChains.repository.module';

@Module({
  imports: [
    ValueChainsRepositoryModule,
    TasksRepositoryModule,
    forwardRef(() => ProductsServiceModule),
    forwardRef(() => TasksServiceModule),
    forwardRef(() => AssignmentsServiceModule),
  ],
  providers: [
    CommonValueChainService,
    FindAllValueChainService,
    FindOneValueChainService,
    CreateValueChainService,
    UpdateValueChainService,
    DeleteValueChainService,
    FixDatesValueChainService,
    RecalculateDatesValueChainService,
  ],
  exports: [
    FindAllValueChainService,
    FindOneValueChainService,
    CreateValueChainService,
    UpdateValueChainService,
    DeleteValueChainService,
    FixDatesValueChainService,
    RecalculateDatesValueChainService,
  ],
})
export class ValueChainsServiceModule {}
