import { Module } from '@nestjs/common';

import { ServicesRepositoryModule } from './services.repository.module';
import { CommonServiceService } from './services/common.service.service';
import { CreateServiceService } from './services/create.service.service';
import { DeleteServiceService } from './services/delete.service.service';
import { FindAllServiceService } from './services/findAll.service.service';
import { FindOneServiceService } from './services/findOne.service.service';
import { UpdateServiceService } from './services/update.service.service';

@Module({
  imports: [ServicesRepositoryModule],
  providers: [
    CommonServiceService,
    FindAllServiceService,
    FindOneServiceService,
    CreateServiceService,
    UpdateServiceService,
    DeleteServiceService,
  ],
  exports: [
    FindAllServiceService,
    FindOneServiceService,
    CreateServiceService,
    UpdateServiceService,
    DeleteServiceService,
  ],
})
export class ServicesServiceModule {}
