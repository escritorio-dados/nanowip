import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MilestonesGroup } from './entities/MilestonesGroup';
import { MilestonesGroupsRepository } from './repositories/milestonesGroups.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MilestonesGroup])],
  providers: [MilestonesGroupsRepository],
  exports: [MilestonesGroupsRepository],
})
export class MilestonesGroupsRepositoryModule {}
