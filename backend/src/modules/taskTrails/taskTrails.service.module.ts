import { Module } from '@nestjs/common';

import { TaskTypesServiceModule } from '@modules/taskTypes/taskTypes.service.module';
import { TrailsServiceModule } from '@modules/trails/trails.service.module';

import { CommonTaskTrailService } from './services/common.taskTrail.service';
import { CreateTaskTrailService } from './services/create.taskTrail.service';
import { DeleteTaskTrailService } from './services/delete.taskTrail.service';
import { FindAllTaskTrailService } from './services/findAll.taskTrail.service';
import { FindOneTaskTrailService } from './services/findOne.taskTrail.service';
import { UpdateTaskTrailService } from './services/update.taskTrail.service';
import { TaskTrailsRepositoryModule } from './taskTrails.repository.module';

@Module({
  imports: [TaskTrailsRepositoryModule, TaskTypesServiceModule, TrailsServiceModule],
  providers: [
    CommonTaskTrailService,
    FindAllTaskTrailService,
    FindOneTaskTrailService,
    CreateTaskTrailService,
    UpdateTaskTrailService,
    DeleteTaskTrailService,
  ],
  exports: [
    FindAllTaskTrailService,
    FindOneTaskTrailService,
    CreateTaskTrailService,
    UpdateTaskTrailService,
    DeleteTaskTrailService,
  ],
})
export class TaskTrailsServiceModule {}
