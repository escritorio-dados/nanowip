import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { CustomersController } from './controllers/customers.controller';
import { CustomersServiceModule } from './customers.service.module';

@Module({
  imports: [CustomersServiceModule, CaslModule],
  controllers: [CustomersController],
})
export class CustomersModule {}
