import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { TasksController } from './controllers/tasks.controller';
import { TasksServiceModule } from './tasks.service.module';

@Module({
  imports: [TasksServiceModule, CaslModule],
  controllers: [TasksController],
})
export class TasksModule {}
