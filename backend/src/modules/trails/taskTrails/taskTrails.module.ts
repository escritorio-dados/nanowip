import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { TaskTrailsController } from './controllers/taskTrails.controller';
import { TaskTrailsServiceModule } from './taskTrails.service.module';

@Module({
  imports: [TaskTrailsServiceModule, CaslModule],
  controllers: [TaskTrailsController],
})
export class TaskTrailsModule {}
