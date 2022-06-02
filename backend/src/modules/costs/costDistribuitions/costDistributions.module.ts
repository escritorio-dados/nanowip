import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { CostDistributionsController } from './controllers/costDistributions.controller';
import { CostDistributionsServiceModule } from './costDistributions.service.module';

@Module({
  imports: [CostDistributionsServiceModule, CaslModule],
  controllers: [CostDistributionsController],
})
export class CostDistributionsModule {}
