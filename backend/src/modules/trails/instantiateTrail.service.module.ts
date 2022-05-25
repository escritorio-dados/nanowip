import { Module } from '@nestjs/common';

import { ProductsServiceModule } from '@modules/products/products.service.module';
import { TasksServiceModule } from '@modules/tasks/tasks/tasks.service.module';
import { TaskTrailsRepositoryModule } from '@modules/taskTrails/taskTrails.repository.module';
import { TaskTrailsServiceModule } from '@modules/taskTrails/taskTrails.service.module';
import { ValueChainsServiceModule } from '@modules/valueChains/valueChains.service.module';

import { InstantiateTrailService } from './services/instantitate.trail.service';

@Module({
  imports: [
    ProductsServiceModule,
    ValueChainsServiceModule,
    TasksServiceModule,
    TaskTrailsServiceModule,
    TaskTrailsRepositoryModule,
  ],
  providers: [InstantiateTrailService],
  exports: [InstantiateTrailService],
})
export class InstantiateTrailServiceModule {}
