import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Measure } from './entities/Measure';
import { MeasuresRepository } from './repositories/measures.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Measure])],
  providers: [MeasuresRepository],
  exports: [MeasuresRepository],
})
export class MeasuresRepositoryModule {}
