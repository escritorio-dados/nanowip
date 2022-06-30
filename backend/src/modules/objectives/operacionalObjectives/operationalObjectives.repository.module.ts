import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OperationalObjective } from './entities/OperationalObjective';
import { OperationalObjectivesRepository } from './repositories/operationalObjectives.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OperationalObjective])],
  providers: [OperationalObjectivesRepository],
  exports: [OperationalObjectivesRepository],
})
export class OperationalObjectivesRepositoryModule {}
