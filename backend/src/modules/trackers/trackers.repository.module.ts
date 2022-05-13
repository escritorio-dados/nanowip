import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tracker } from './entities/Tracker';
import { TrackersRepository } from './repositories/trackers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tracker])],
  providers: [TrackersRepository],
  exports: [TrackersRepository],
})
export class TrackersRepositoryModule {}
