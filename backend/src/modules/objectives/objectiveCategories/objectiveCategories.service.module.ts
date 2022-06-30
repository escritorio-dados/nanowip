import { Module } from '@nestjs/common';

import { OperationalObjectivesServiceModule } from '../operacionalObjectives/operationalObjectives.service.module';
import { ObjectiveCategoriesRepositoryModule } from './objectiveCategories.repository.module';
import { CommonObjectiveCategoryService } from './services/common.objectiveCategory.service';
import { CreateObjectiveCategoryService } from './services/create.objectiveCategory.service';
import { DeleteObjectiveCategoryService } from './services/delete.objectiveCategory.service';
import { FindAllObjectiveCategoryService } from './services/findAll.objectiveCategory.service';
import { FindOneObjectiveCategoryService } from './services/findOne.objectiveCategory.service';
import { UpdateObjectiveCategoryService } from './services/update.objectiveCategory.service';

@Module({
  imports: [ObjectiveCategoriesRepositoryModule, OperationalObjectivesServiceModule],
  providers: [
    CommonObjectiveCategoryService,
    CreateObjectiveCategoryService,
    FindAllObjectiveCategoryService,
    FindOneObjectiveCategoryService,
    UpdateObjectiveCategoryService,
    DeleteObjectiveCategoryService,
  ],
  exports: [
    CreateObjectiveCategoryService,
    FindAllObjectiveCategoryService,
    FindOneObjectiveCategoryService,
    UpdateObjectiveCategoryService,
    DeleteObjectiveCategoryService,
  ],
})
export class ObjectiveCategoriesServiceModule {}
