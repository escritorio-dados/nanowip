import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/Task';
import { TasksRepository } from './repositories/tasks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [TasksRepository],
  exports: [TasksRepository],
})
export class TasksRepositoryModule {}
