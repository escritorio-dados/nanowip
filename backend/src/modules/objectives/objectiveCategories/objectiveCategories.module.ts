import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ObjectiveCategoriesController } from './controllers/objectiveCategories.controller';
import { ObjectiveCategoriesServiceModule } from './objectiveCategories.service.module';

@Module({
  imports: [ObjectiveCategoriesServiceModule, CaslModule],
  controllers: [ObjectiveCategoriesController],
})
export class ObjectiveCategoriesModule {}
