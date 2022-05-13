import { Module } from '@nestjs/common';

import { ProductsServiceModule } from '@modules/products/products.service.module';

import { CostsRepositoryModule } from '../costs/costs.repository.module';
import { CostsServiceModule } from '../costs/costs.service.module';
import { ServicesServiceModule } from '../services/services.service.module';
import { CostDistributionsRepositoryModule } from './costDistributions.repository.module';
import { CommonCostDistributionService } from './service/common.costDistribution.service';
import { CreateCostDistributionService } from './service/create.costDistribution.service';
import { DeleteCostDistributionService } from './service/delete.costDistribution.service';
import { FindAllCostDistributionService } from './service/findAll.costDistribution.service';
import { FindOneCostDistributionService } from './service/findOne.costDistribution.service';
import { UpdateCostDistributionService } from './service/update.costDistribution.service';

@Module({
  imports: [
    CostDistributionsRepositoryModule,
    CostsServiceModule,
    ProductsServiceModule,
    ServicesServiceModule,
    CostsRepositoryModule,
  ],
  providers: [
    CommonCostDistributionService,
    FindAllCostDistributionService,
    FindOneCostDistributionService,
    CreateCostDistributionService,
    UpdateCostDistributionService,
    DeleteCostDistributionService,
  ],
  exports: [
    CommonCostDistributionService,
    FindAllCostDistributionService,
    FindOneCostDistributionService,
    CreateCostDistributionService,
    UpdateCostDistributionService,
    DeleteCostDistributionService,
  ],
})
export class CostDistributionsServiceModule {}
