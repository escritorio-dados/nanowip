import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { TaskReportCommentsController } from './controllers/taskReportComment.controller';
import { TaskReportCommentsServiceModule } from './taskReportComments.service.module';

@Module({
  imports: [TaskReportCommentsServiceModule, CaslModule],
  controllers: [TaskReportCommentsController],
})
export class TaskReportCommentsModule {}
