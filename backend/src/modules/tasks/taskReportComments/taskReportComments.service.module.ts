import { Module } from '@nestjs/common';

import { TasksServiceModule } from '../tasks/tasks.service.module';
import { CommonTaskReportCommentService } from './services/common.taskReportComment.service';
import { CreateTaskReportCommentService } from './services/create.taskReportComment.service';
import { DeleteTaskReportCommentService } from './services/delete.taskReportComment.service';
import { FindAllTaskReportCommentService } from './services/findAll.taskReportComment.service';
import { FindOneTaskReportCommentService } from './services/findOne.taskReportComment.service';
import { UpdateTaskReportCommentService } from './services/update.taskReportComment.service';
import { TaskReportCommentsRepositoryModule } from './taskReportComments.repository.module';

@Module({
  imports: [TaskReportCommentsRepositoryModule, TasksServiceModule],
  providers: [
    CommonTaskReportCommentService,
    FindAllTaskReportCommentService,
    FindOneTaskReportCommentService,
    CreateTaskReportCommentService,
    UpdateTaskReportCommentService,
    DeleteTaskReportCommentService,
  ],
  exports: [
    FindAllTaskReportCommentService,
    FindOneTaskReportCommentService,
    CreateTaskReportCommentService,
    UpdateTaskReportCommentService,
    DeleteTaskReportCommentService,
  ],
})
export class TaskReportCommentsServiceModule {}
