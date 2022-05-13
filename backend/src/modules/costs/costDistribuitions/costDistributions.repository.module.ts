import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CostDistribution } from './entities/CostDistribution';
import { CostDistributionsRepository } from './repositories/costDistributions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CostDistribution])],
  providers: [CostDistributionsRepository],
  exports: [CostDistributionsRepository],
})
export class CostDistributionsRepositoryModule {}
