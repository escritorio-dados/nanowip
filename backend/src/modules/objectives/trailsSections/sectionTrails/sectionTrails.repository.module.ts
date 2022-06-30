import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SectionTrail } from './entities/SectionTrail';
import { SectionTrailsRepository } from './repositories/sectionTrails.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SectionTrail])],
  providers: [SectionTrailsRepository],
  exports: [SectionTrailsRepository],
})
export class SectionTrailsRepositoryModule {}
