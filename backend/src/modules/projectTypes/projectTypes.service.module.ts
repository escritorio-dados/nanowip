import { Module } from '@nestjs/common';

import { ProjectTypesRepositoryModule } from './projectTypes.repository.module';
import { CommonProjectTypeService } from './services/common.projectType.service';
import { CreateProjectTypeService } from './services/create.projectType.service';
import { DeleteProjectTypeService } from './services/delete.projectType.service';
import { FindAllProjectTypeService } from './services/findAll.projectType.service';
import { FindOneProjectTypeService } from './services/findOne.projectType.service';
import { UpdateProjectTypeService } from './services/update.projectType.service';

@Module({
  imports: [ProjectTypesRepositoryModule],
  providers: [
    CommonProjectTypeService,
    FindAllProjectTypeService,
    FindOneProjectTypeService,
    CreateProjectTypeService,
    UpdateProjectTypeService,
    DeleteProjectTypeService,
  ],
  exports: [
    FindAllProjectTypeService,
    FindOneProjectTypeService,
    CreateProjectTypeService,
    UpdateProjectTypeService,
    DeleteProjectTypeService,
  ],
})
export class ProjectTypesServiceModule {}
