import { Module } from '@nestjs/common';

import { CommonTaskTypeService } from './services/common.taskType.service';
import { CreateTaskTypeService } from './services/create.taskType.service';
import { DeleteTaskTypeService } from './services/delete.taskType.service';
import { FindAllTaskTypeService } from './services/findAll.taskType.service';
import { FindOneTaskTypeService } from './services/findOne.taskType.service';
import { UpdateTaskTypeService } from './services/update.taskType.service';
import { TaskTypesRepositoryModule } from './taskTypes.repository.module';

@Module({
  imports: [TaskTypesRepositoryModule],
  providers: [
    CommonTaskTypeService,
    FindAllTaskTypeService,
    FindOneTaskTypeService,
    CreateTaskTypeService,
    UpdateTaskTypeService,
    DeleteTaskTypeService,
  ],
  exports: [
    FindAllTaskTypeService,
    FindOneTaskTypeService,
    CreateTaskTypeService,
    UpdateTaskTypeService,
    DeleteTaskTypeService,
  ],
})
export class TaskTypesServiceModule {}
