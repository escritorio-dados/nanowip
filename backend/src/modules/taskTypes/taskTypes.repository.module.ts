import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskType } from './entities/TaskType';
import { TaskTypesRepository } from './repositories/taskTypes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TaskType])],
  providers: [TaskTypesRepository],
  exports: [TaskTypesRepository],
})
export class TaskTypesRepositoryModule {}
