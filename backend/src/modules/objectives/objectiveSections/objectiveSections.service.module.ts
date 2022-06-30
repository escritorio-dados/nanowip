import { Module } from '@nestjs/common';

import { ObjectiveCategoriesServiceModule } from '../objectiveCategories/objectiveCategories.service.module';
import { ObjectiveSectionsRepositoryModule } from './objectiveSections.repository.module';
import { CommonObjectiveSectionService } from './services/common.objectiveSection.service';
import { CreateObjectiveSectionService } from './services/create.objectiveSection.service';
import { DeleteObjectiveSectionService } from './services/delete.objectiveSection.service';
import { FindAllObjectiveSectionService } from './services/findAll.objectiveSection.service';
import { FindOneObjectiveSectionService } from './services/findOne.objectiveSection.service';
import { UpdateObjectiveSectionService } from './services/update.objectiveSection.service';

@Module({
  imports: [ObjectiveSectionsRepositoryModule, ObjectiveCategoriesServiceModule],
  providers: [
    CommonObjectiveSectionService,
    CreateObjectiveSectionService,
    FindAllObjectiveSectionService,
    FindOneObjectiveSectionService,
    UpdateObjectiveSectionService,
    DeleteObjectiveSectionService,
  ],
  exports: [
    CreateObjectiveSectionService,
    FindAllObjectiveSectionService,
    FindOneObjectiveSectionService,
    UpdateObjectiveSectionService,
    DeleteObjectiveSectionService,
  ],
})
export class ObjectiveSectionsServiceModule {}
