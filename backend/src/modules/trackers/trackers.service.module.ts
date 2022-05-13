import { forwardRef, Module } from '@nestjs/common';

import { AssignmentsServiceModule } from '@modules/assignments/assignments.service.module';
import { CollaboratorsServiceModule } from '@modules/collaborators/collaborators.service.module';
import { TasksServiceModule } from '@modules/tasks/tasks.service.module';

import { CommonTrackerService } from './services/common.tracker.service';
import { CreateTrackerService } from './services/create.tracker.service';
import { DeleteTrackerService } from './services/delete.tracker.service';
import { FindAllTrackerService } from './services/findAll.tracker.service';
import { FindOneTrackerService } from './services/findOne.tracker.service';
import { UpdateTrackerService } from './services/update.tracker.service';
import { TrackersRepositoryModule } from './trackers.repository.module';

@Module({
  imports: [
    TrackersRepositoryModule,
    CollaboratorsServiceModule,
    forwardRef(() => TasksServiceModule),
    forwardRef(() => AssignmentsServiceModule),
  ],
  providers: [
    CommonTrackerService,
    FindAllTrackerService,
    FindOneTrackerService,
    CreateTrackerService,
    UpdateTrackerService,
    DeleteTrackerService,
  ],
  exports: [
    FindAllTrackerService,
    FindOneTrackerService,
    CreateTrackerService,
    UpdateTrackerService,
    DeleteTrackerService,
  ],
})
export class TrackersServiceModule {}
