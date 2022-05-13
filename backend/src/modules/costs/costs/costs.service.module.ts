import { Module } from '@nestjs/common';

import { DocumentTypesServiceModule } from '../documentTypes/documentTypes.service.module';
import { ServiceProvidersServiceModule } from '../serviceProviders/serviceProviders.service.module';
import { CostsRepositoryModule } from './costs.repository.module';
import { CommonCostService } from './services/common.cost.service';
import { CreateCostService } from './services/create.cost.service';
import { DeleteCostService } from './services/delete.cost.service';
import { FindAllCostService } from './services/findAll.cost.service';
import { FindOneCostService } from './services/findOne.cost.service';
import { RecalculatePercentCostService } from './services/recalculatePercent.cost.service';
import { UpdateCostService } from './services/update.cost.service';

@Module({
  imports: [CostsRepositoryModule, ServiceProvidersServiceModule, DocumentTypesServiceModule],
  providers: [
    CommonCostService,
    FindAllCostService,
    FindOneCostService,
    CreateCostService,
    UpdateCostService,
    DeleteCostService,
    RecalculatePercentCostService,
  ],
  exports: [
    FindAllCostService,
    FindOneCostService,
    CreateCostService,
    UpdateCostService,
    DeleteCostService,
    RecalculatePercentCostService,
  ],
})
export class CostsServiceModule {}
