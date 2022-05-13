import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskTrail } from './entities/TaskTrail';
import { TaskTrailsRepository } from './repositories/taskTrails.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TaskTrail])],
  providers: [TaskTrailsRepository],
  exports: [TaskTrailsRepository],
})
export class TaskTrailsRepositoryModule {}
