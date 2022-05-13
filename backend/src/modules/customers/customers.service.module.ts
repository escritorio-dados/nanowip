import { Module } from '@nestjs/common';

import { CustomersRepositoryModule } from './customers.repository.module';
import { CommonCustomerService } from './services/commonCustomer.service';
import { CreateCustomerService } from './services/createCustomer.service';
import { DeleteCustomerService } from './services/deleteCustomer.service';
import { FindAllCustomerService } from './services/findAllCustomer.service';
import { FindOneCustomerService } from './services/findOneCustomer.service';
import { UpdateCustomerService } from './services/updateCustomer.service';

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
