import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Milestone } from './entities/Milestone';
import { MilestonesRepository } from './repositories/milestones.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Milestone])],
  providers: [MilestonesRepository],
  exports: [MilestonesRepository],
})
export class MilestonesRepositoryModule {}
