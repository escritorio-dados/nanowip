import { Module } from '@nestjs/common';

import { ObjectiveCategoriesServiceModule } from '@modules/objectives/objectiveCategories/objectiveCategories.service.module';
import { ObjectiveSectionsRepositoryModule } from '@modules/objectives/objectiveSections/objectiveSections.repository.module';

import { SectionTrailsServiceModule } from './sectionTrails.service.module';
import { InstantiateSectionTrailService } from './services/instantitate.sectionTrail.service';

@Module({
  imports: [
    SectionTrailsServiceModule,
    ObjectiveSectionsRepositoryModule,
    ObjectiveCategoriesServiceModule,
  ],
  providers: [InstantiateSectionTrailService],
  exports: [InstantiateSectionTrailService],
})
export class InstantiateSectionTrailServiceModule {}
