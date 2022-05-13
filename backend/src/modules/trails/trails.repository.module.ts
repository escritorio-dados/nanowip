import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Trail } from './entities/Trail';
import { TrailsRepository } from './repositories/trails.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Trail])],
  providers: [TrailsRepository],
  exports: [TrailsRepository],
})
export class TrailsRepositoryModule {}
