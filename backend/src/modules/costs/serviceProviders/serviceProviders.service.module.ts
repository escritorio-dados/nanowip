import { Module } from '@nestjs/common';

import { ServiceProvidersRepositoryModule } from './serviceProviders.repository.module';
import { CommonServiceProviderService } from './services/common.serviceProvider.service';
import { CreateServiceProviderService } from './services/create.serviceProvider.service';
import { DeleteServiceProviderService } from './services/delete.serviceProvider.service';
import { FindAllServiceProviderService } from './services/findAll.serviceProvider.service';
import { FindOneServiceProviderService } from './services/findOne.serviceProvider.service';
import { UpdateServiceProviderService } from './services/update.serviceProvider.service';

@Module({
  imports: [ServiceProvidersRepositoryModule],
  providers: [
    CommonServiceProviderService,
    FindAllServiceProviderService,
    FindOneServiceProviderService,
    CreateServiceProviderService,
    UpdateServiceProviderService,
    DeleteServiceProviderService,
  ],
  exports: [
    FindAllServiceProviderService,
    FindOneServiceProviderService,
    CreateServiceProviderService,
    UpdateServiceProviderService,
    DeleteServiceProviderService,
  ],
})
export class ServiceProvidersServiceModule {}
