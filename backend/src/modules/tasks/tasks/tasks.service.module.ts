import { forwardRef, Module } from '@nestjs/common';

import { AssignmentsRepositoryModule } from '@modules/assignments/assignments.repository.module';
import { AssignmentsServiceModule } from '@modules/assignments/assignments.service.module';
import { TaskTypesServiceModule } from '@modules/tasks/taskTypes/taskTypes.service.module';
import { TrackersRepositoryModule } from '@modules/trackers/trackers.repository.module';
import { ValueChainsRepositoryModule } from '@modules/valueChains/valueChains.repository.module';
import { ValueChainsServiceModule } from '@modules/valueChains/valueChains.service.module';

import { CommonTaskService } from './services/common.task.service';
import { CreateTaskService } from './services/create.task.service';
import { DeleteTaskService } from './services/delete.task.service';
import { FindAllTaskService } from './services/findAll.task.service';
import { FindOneTaskService } from './services/findOne.task.service';
import { FixDatesTaskService } from './services/fixDates.task.service';
import { RecalculateDatesTaskService } from './services/recalculateDates.task.service';
import { UpdateTaskService } from './services/update.task.service';
import { TasksRepositoryModule } from './tasks.repository.module';

@Module({
  imports: [
    TasksRepositoryModule,
    ValueChainsRepositoryModule,
    AssignmentsRepositoryModule,
    TrackersRepositoryModule,
    TaskTypesServiceModule,
    forwardRef(() => ValueChainsServiceModule),
    forwardRef(() => AssignmentsServiceModule),
  ],
  providers: [
    CommonTaskService,
    FindAllTaskService,
    FindOneTaskService,
    CreateTaskService,
    UpdateTaskService,
    DeleteTaskService,
    FixDatesTaskService,
    RecalculateDatesTaskService,
  ],
  exports: [
    FindAllTaskService,
    FindOneTaskService,
    CreateTaskService,
    UpdateTaskService,
    DeleteTaskService,
    FixDatesTaskService,
    RecalculateDatesTaskService,
  ],
})
export class TasksServiceModule {}
