import { Module } from '@nestjs/common';

import { ObjectiveCategoriesServiceModule } from '@modules/objectives/objectiveCategories/objectiveCategories.service.module';
import { ObjectiveSectionsServiceModule } from '@modules/objectives/objectiveSections/objectiveSections.service.module';

import { SectionTrailsRepositoryModule } from './sectionTrails.repository.module';
import { SectionTrailsServiceModule } from './sectionTrails.service.module';
import { InstantiateSectionTrailService } from './services/instantitate.sectionTrail.service';

@Module({
  imports: [
    SectionTrailsServiceModule,
    SectionTrailsRepositoryModule,
    ObjectiveCategoriesServiceModule,
    ObjectiveSectionsServiceModule,
  ],
  providers: [InstantiateSectionTrailService],
  exports: [InstantiateSectionTrailService],
})
export class InstantiateSectionTrailServiceModule {}
