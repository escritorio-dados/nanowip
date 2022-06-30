import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IntegratedObjective } from './entities/IntegratedObjective';
import { IntegratedObjectivesRepository } from './repositories/integratedObjectives.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegratedObjective])],
  providers: [IntegratedObjectivesRepository],
  exports: [IntegratedObjectivesRepository],
})
export class IntegratedObjectivesRepositoryModule {}
