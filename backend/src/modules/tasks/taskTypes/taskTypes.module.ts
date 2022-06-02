import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { TaskTypesController } from './controllers/taskTypes.controller';
import { TaskTypesServiceModule } from './taskTypes.service.module';

@Module({
  imports: [TaskTypesServiceModule, CaslModule],
  controllers: [TaskTypesController],
})
export class TaskTypesModule {}
