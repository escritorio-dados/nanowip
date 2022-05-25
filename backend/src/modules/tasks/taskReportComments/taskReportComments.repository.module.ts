import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskReportComment } from './entities/TaskReportComment';
import { TaskReportCommentsRepository } from './repositories/taskReportComments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TaskReportComment])],
  providers: [TaskReportCommentsRepository],
  exports: [TaskReportCommentsRepository],
})
export class TaskReportCommentsRepositoryModule {}
