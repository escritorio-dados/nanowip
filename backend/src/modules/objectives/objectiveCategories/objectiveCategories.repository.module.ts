import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectiveCategory } from './entities/ObjectiveCategory';
import { ObjectiveCategoriesRepository } from './repositories/objectiveCategories.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectiveCategory])],
  providers: [ObjectiveCategoriesRepository],
  exports: [ObjectiveCategoriesRepository],
})
export class ObjectiveCategoriesRepositoryModule {}
