import { Module } from '@nestjs/common';

import { CustomersRepositoryModule } from './customers.repository.module';
import { CommonCustomerService } from './services/common.customer.service';
import { CreateCustomerService } from './services/create.customer.service';
import { DeleteCustomerService } from './services/delete.customer.service';
import { FindAllCustomerService } from './services/findAll.customer.service';
import { FindOneCustomerService } from './services/findOne.customer.service';
import { UpdateCustomerService } from './services/update.customer.service';

@Module({
  imports: [CustomersRepositoryModule],
  providers: [
    CommonCustomerService,
    FindAllCustomerService,
    FindOneCustomerService,
    CreateCustomerService,
    UpdateCustomerService,
    DeleteCustomerService,
  ],
  exports: [
    FindAllCustomerService,
    FindOneCustomerService,
    CreateCustomerService,
    UpdateCustomerService,
    DeleteCustomerService,
  ],
})
export class CustomersServiceModule {}
