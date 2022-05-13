import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Assignment } from './entities/Assignment';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment])],
  providers: [AssignmentsRepository],
  exports: [AssignmentsRepository],
})
export class AssignmentsRepositoryModule {}
