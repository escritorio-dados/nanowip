import { forwardRef, Module } from '@nestjs/common';

import { CollaboratorStatusServiceModule } from '@modules/collaborators/colaboratorsStatus/collaboratorsStatus.service.module';
import { CollaboratorsServiceModule } from '@modules/collaborators/collaborators/collaborators.service.module';
import { TasksRepositoryModule } from '@modules/tasks/tasks/tasks.repository.module';
import { TasksServiceModule } from '@modules/tasks/tasks/tasks.service.module';
import { TrackersRepositoryModule } from '@modules/trackers/trackers.repository.module';
import { TrackersServiceModule } from '@modules/trackers/trackers.service.module';
import { ValueChainsServiceModule } from '@modules/valueChains/valueChains.service.module';

import { AssignmentsRepositoryModule } from './assignments.repository.module';
import { CloseAssignmentsTaskService } from './services/closeAssignmentsTask.service';
import { CommonAssignmentService } from './services/common.assignment.service';
import { CreateAssignmentService } from './services/create.assignment.service';
import { DeleteAssignmentService } from './services/delete.assignment.service';
import { FindAllAssignmentService } from './services/findAll.assignment.service';
import { FindOneAssignmentService } from './services/findOne.assignment.service';
import { FixDatesAssignmentService } from './services/fixDates.assignment.service';
import { RecalculateDatesAssignmentService } from './services/recalculateDates.assignment.service';
import { UpdateAssignmentService } from './services/update.assignment.service';

@Module({
  imports: [
    AssignmentsRepositoryModule,
    TasksRepositoryModule,
    TrackersRepositoryModule,
    CollaboratorsServiceModule,
    CollaboratorStatusServiceModule,
    forwardRef(() => ValueChainsServiceModule),
    forwardRef(() => TrackersServiceModule),
    forwardRef(() => TasksServiceModule),
  ],
  providers: [
    CommonAssignmentService,
    FindAllAssignmentService,
    FindOneAssignmentService,
    CreateAssignmentService,
    UpdateAssignmentService,
    DeleteAssignmentService,
    FixDatesAssignmentService,
    CloseAssignmentsTaskService,
    RecalculateDatesAssignmentService,
  ],
  exports: [
    FindAllAssignmentService,
    FindOneAssignmentService,
    CreateAssignmentService,
    UpdateAssignmentService,
    DeleteAssignmentService,
    FixDatesAssignmentService,
    CloseAssignmentsTaskService,
    RecalculateDatesAssignmentService,
  ],
})
export class AssignmentsServiceModule {}
