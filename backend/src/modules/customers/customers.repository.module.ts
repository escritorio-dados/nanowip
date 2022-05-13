import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from './entities/Customer';
import { CustomersRepository } from './repositories/customers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomersRepository],
  exports: [CustomersRepository],
})
export class CustomersRepositoryModule {}
