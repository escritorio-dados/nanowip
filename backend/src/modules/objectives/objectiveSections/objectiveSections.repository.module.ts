import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectiveSection } from './entities/ObjectiveSection';
import { ObjectiveSectionsRepository } from './repositories/objectiveSections.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectiveSection])],
  providers: [ObjectiveSectionsRepository],
  exports: [ObjectiveSectionsRepository],
})
export class ObjectiveSectionsRepositoryModule {}
